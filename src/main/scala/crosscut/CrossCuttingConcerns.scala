package crosscut

import typings.node.anon.ObjectEncodingOptionsflagEncoding
import typings.node.fsMod
import typings.obsidian.mod
import typings.obsidian.mod.FileSystemAdapter
import utils.Utils

import scala.collection.immutable.HashSet
import scala.collection.mutable
import scala.language.postfixOps
import scala.scalajs.js
import scala.scalajs.js.Dynamic.literal as l

object CrossCuttingConcerns:

  private type DOCNAME   = String
  private type DOCSTRING = String
  private type MARKER    = String
  private type SOLNAME   = String
  private type PATHNAME  = String

  private val markerRegExp = """( |\t|^)\^([a-zA-Z0-9]+\-)*[a-zA-Z0-9]+\-[0-9]+""".r
  def apply(app : mod.App, storyFolder : String,  solutionFolder : String, docFolder: String, mappingFile : String) : Unit =
    //
    // if a mapping file has been defined then get the mappings : format is 'marker'='mapping-value'
    //
    val vaultPath = app.vault.adapter.asInstanceOf[FileSystemAdapter].getBasePath()

    val markerMappings : Map[String, String] = if !mappingFile.equalsIgnoreCase("UNDEFINED") && mappingFile.nonEmpty then
      val markerFileLocation = s"$vaultPath${Utils.separator}$mappingFile"
      fsMod.readFileSync(markerFileLocation, l(encoding = "utf8", flag = "r")
        .asInstanceOf[ObjectEncodingOptionsflagEncoding])
        .asInstanceOf[String]
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
    val markerToDocMap     = mutable.HashMap[MARKER, DOCNAME]()
    val docToMarkerMap     = mutable.HashMap[DOCNAME, List[MARKER]]()
    val solToMarkerMap     = mutable.HashMap[SOLNAME, List[MARKER]]()
    val allSolutionFiles   = mutable.HashSet[MARKER]()
    //
    // get all the doc files to scan
    //
    val docPath = s"$vaultPath${Utils.separator}$docFolder"
    val docFiles = Utils.walk(docPath).filter(name => name.endsWith(".md")).toList
    //
    // remove all the solution files
    //
    val solPath = s"$vaultPath${Utils.separator}$solutionFolder"
    val solFiles = Utils.walk(solPath).filter(name => name.endsWith(".md")).toList
    solFiles.foreach(file => fsMod.unlinkSync(file))
    //
    // pick up all markers in the doc string doc file by doc file and aggregate the markers
    // before processing them
    //
    val markerlist = mutable.ListBuffer[String]()
    docFiles.foreach(docFile =>
      val str = fsMod.readFileSync(docFile, l(encoding = "utf8", flag = "r")
        .asInstanceOf[ObjectEncodingOptionsflagEncoding])
        .asInstanceOf[String]

      val markersMatch = markerRegExp.findAllMatchIn(str)
      val markersPerDoc = markersMatch.map(marker => str.substring(marker.start, marker.end).trim).toList

      markerlist ++= markersPerDoc

      val docName = docFile.split(Utils.separator).last

      markersPerDoc.foreach(marker =>
        markerToDocMap += (marker -> docName)
      )

      docToMarkerMap += (docName -> markersPerDoc)

    )

    val allLocalMarkerNames = markerlist.map(marker =>
      marker.drop(1).split("-").dropRight(1).mkString("-")
    ).toSet.asInstanceOf[Set[MARKER]]

    allSolutionFiles ++= allLocalMarkerNames
    //
    // make sure the paths exist for every solutions file
    //
    allSolutionFiles.foreach(file =>
      val solFile =  solutionPathFromMarker(solutionFolder, file)
      fsMod.mkdirSync(solFile, l(recursive =  true).asInstanceOf[fsMod.MakeDirectoryOptions])
    )
    //
    // collect all markers in one list
    // sort them then
    // group by path/name.md excluding the seq number
    //
    val allMarkers = docToMarkerMap
      .values
      .toList
      .flatten
      .sortWith( (s1, s2) =>
        s1 < s2
      )
      .groupBy(by => solutionDocNameFromMarker(solutionFolder, by))
    //
    // write out
    //
    allMarkers.foreach( ( solName, markers ) =>
      //
      // build link to story
      //
      val mdString = StringBuilder(s"""![[$storyFolder${Utils.separator}${getStoryFileName(solName.dropRight(3), markerMappings)}#^summary]]\n""")
      markers.foreach(marker =>
        //
        // build links to document thread
        //
        mdString ++= s"""![[${markerToDocMap(marker)}#${marker}]]\n"""
      )
      //
      // remove solution file it exists and recreate with new values.
      //
      val marker = markers.head.drop(1).split("-").dropRight(1).mkString("-")
      println(marker)
      val solNameWithPath = getSolutionFileName(marker, s"$vaultPath${Utils.separator}$solName", markerMappings)
      fsMod.writeFile(solNameWithPath, mdString.toString(), err => ())
    )

  private def getSolutionFileName(marker : String,  solName : String, mapping : Map[String, String]) : String =
    // get solution name strip off the .md
    if mapping.contains(marker) then
      solName.replace(marker, mapping(marker))
    else
      solName

  /**
   * given the solution name return the story name, if the story name is in mapping then use that rather
   * @param solName to use for the story name
   * @return the story name
   */
  private def getStoryFileName(solName : SOLNAME, mapping : Map[String, String]) : String =
    val nameList = solName.split("/").drop(1)
    val storyName = nameList.last
    if mapping.contains(storyName) then
      s"${nameList.dropRight(1).mkString("/")}${mapping(storyName)}"
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
    val docName = markerList.dropRight(1).mkString(Utils.separator)
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
    val pathName = s""""${markerList.dropRight(1).mkString(Utils.separator)}"""

    s"""$solFolder${Utils.separator}$pathName"""
