package crosscut

import typings.obsidian.mod
import typings.obsidian.mod.FileSystemAdapter
import utils.Utils

import scala.collection.mutable
import scala.language.postfixOps
import scala.scalajs.js
import scala.scalajs.js.Dynamic.literal as l
import scala.scalajs.js.JSConverters.*
import concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}

object CrossCuttingConcerns:

  private type DOCNAME   = String
  private type DOCSTRING = String
  private type MARKER    = String
  private type SOLNAME   = String
  private type PATHNAME  = String

  /**
   * ## object CrossCuttingConcerns
   * Setup all the cross cutting concerns for the solution threads. These solution threads are marked by using markers
   * that is picked up from the document md files and placed in the solution folder. ^crosscut-00
   *
   * When applied extract cross cutting text
   */
  def apply(app : mod.App, storyFolder : String,  solutionFolder : String, docFolder: String, markerMapping : String) : Unit =
    //bus
    //bus if a mapping string has been defined then get the mappings : format is 'marker'='mapping-value'
    //
    val fsa = app.vault.adapter.asInstanceOf[FileSystemAdapter]

    val markerMappings : Map[String, String] = if markerMapping.nonEmpty then
      markerMapping
        .split("\n")
        .map( value =>
          if value.contains("=") then
            val lst = value.split("=")
            ( lst(0), lst(1) )
          else
            ( "", "" )
        )
        .toMap
    else
      Map[String, String]()
    //
    // some containers to use later on
    //
    val markerToDocumentMap     = mutable.SortedMap[MARKER, DOCNAME]()
    val markerToStoryMap        = mutable.SortedMap[MARKER, DOCNAME]()
    val documentToMarkerMap     = mutable.HashMap[DOCNAME, List[MARKER]]()
    val storyToMarkerMap        = mutable.HashMap[DOCNAME, List[MARKER]]()
    val solutionToMarkerMap     = mutable.HashMap[SOLNAME, List[MARKER]]()
    val allSolutionFiles        = mutable.HashSet[MARKER]()
    //
    //bus remove all the solution files and the then empty solution folder
    // -----------------------------------------------------------------------------------------------------------------
    val filesToDelete = Utils.listMDFilesInVault(fsa, solutionFolder)

    filesToDelete.foreach(fileName =>
      fsa.remove(fileName).toFuture.foreach(Unit => ())
    )

    fsa.rmdir(solutionFolder, true).toFuture.foreach(Unit => ())
    fsa.mkdir(solutionFolder).toFuture.foreach(Unit => ())

    // -----------------------------------------------------------------------------------------------------------------
    //
    // get all the doc and story files files to scan
    //
    val documentFiles = Utils.listMDFilesInVault(fsa, docFolder)
    val storyFiles = Utils.listMDFilesInVault(fsa, storyFolder)

    //
    // pick up all markers in the doc string doc file by doc file and aggregate the markers
    // before processing them
    //
    val allFutures = mutable.ListBuffer[Future[Unit]]()
    val markerList = mutable.ListBuffer[String]()

    documentFiles.foreach(docFile =>
      allFutures += fsa.read(docFile).toFuture.map(str =>

        val markersMatch = Utils.markerRegExp.findAllMatchIn(str)
        val markersPerDocument = markersMatch.map(marker => str.substring(marker.start, marker.end).trim).toList

        markerList ++= markersPerDocument

        val documentName = docFile.split("/").last

        markersPerDocument.foreach(marker =>
          markerToDocumentMap += (marker -> docFile)
        )

        documentToMarkerMap += (documentName -> markersPerDocument)

      )
    )
    storyFiles.foreach(storyFile =>
      allFutures += fsa.read(storyFile).toFuture.map(str =>

        val markersMatch = Utils.markerRegExp.findAllMatchIn(str)
        val markersPerStory = markersMatch.map(marker => str.substring(marker.start, marker.end).trim).toList

        markerList ++= markersPerStory

        val documentName = storyFile.split("/").last

        markersPerStory.foreach(marker =>
          markerToStoryMap += (marker -> storyFile)
        )

        storyToMarkerMap += (documentName -> markersPerStory)

      )
    )
    //
    // wait for all work to be done
    //
    val waitingForFutures: Future[List[Unit]] = Future.sequence(allFutures.toList)

    waitingForFutures.onComplete {
      case Success(_) =>
        //
        // collect all markers in one list
        // sort them then
        // group by path/name.md excluding the seq number
        //
        val allMarkers = documentToMarkerMap
          .values
          .toList
          .flatten
          .sortWith((s1, s2) =>
            s1 < s2
          )
          .groupBy(by => solutionDocNameFromMarker(solutionFolder, by))
        //
        // write out
        //
        val mdString = StringBuilder()
        allMarkers.foreach((solName, markers) =>
          //
          // build link to story, filter the story markers as well
          //
          val markerToStory = markerToStoryMap.filter((marker, Story) =>
            markers.head.startsWith(marker.split("-").dropRight(1).mkString("-"))
          )
          //
          // setup die story links first
          //
          val mdString = StringBuilder("## Requirement\n")
          markerToStory.foreach((marker, story) =>
             mdString ++= s"""![[${markerToStoryMap(marker)}#${marker}]]\n"""
          )
          mdString ++= "## Solution\n"
          markers.foreach(marker =>
            //
            // build links to document thread
            //
            mdString ++= s"""![[${markerToDocumentMap(marker)}#${marker}]]\n"""
          )
          val marker = markers.head.drop(1).split("-").dropRight(1).mkString("-")
          val solNameWithPath = getSolutionFileName(marker, s"$solName", markerMappings)
          //
          // create the folder path if required and write out text
          //
          Utils.makeDirInVault(fsa, solNameWithPath)
          fsa.write(solNameWithPath, mdString.toString())
        )
      case Failure(ex) => println(s"Failed to complete all futures: ${ex.getMessage}")
    }

  private def getSolutionFileName(marker : String,  solName : String, mapping : Map[String, String]) : String =
    // get solution name strip off the .md
    val solution = if mapping.contains(marker) then
      solName.replace(marker, mapping(marker))
    else
      solName

    solution.split(Utils.separatorRegEx).mkString("/")

  /**
   * given the solution name return the story name, if the story name is in mapping then use that rather
   * Note that separator is '/' and not the os separator. Vault path naming convention is '/'
   * @param solName to use for the story name
   * @return the story name
   */
  private def getStoryFileName(solName : SOLNAME, mapping : Map[String, String]) : String =
    val nameList = solName.split(Utils.separatorRegEx).drop(1)
    val storyName = nameList.last
    if mapping.contains(storyName) then
      s"${nameList.dropRight(1).mkString("/#")}${mapping(storyName)}"
    else
      nameList.mkString("/")

  /**
   * Take a marker string and convert into file path / file name.md. If the marker excluding the -[0-9]+
   * is in mapping then use that mapping value
   * @param marker in document string
   * @return
   */
  private def solutionDocNameFromMarker(solFolder : String, marker : String): SOLNAME =
    val markerList = marker.drop(1).split("-")
    val docName = markerList.dropRight(1).mkString("/")
    val solutionName = s"${docName}.md"
    s"""$solFolder${Utils.separator}$solutionName"""

  /**
   * Take a marker string and convert into file path
   *
   * @param marker
   * @return
   */
  private def solutionPathFromMarker(solFolder : String, marker: String): PATHNAME =
    val markerStr = marker.drop(1)
    val markerList = markerStr.split("-").dropRight(2)
    val pathName = s""""${markerList.dropRight(1).mkString("/")}"""

    s"""$solFolder${Utils.separator}$pathName"""
