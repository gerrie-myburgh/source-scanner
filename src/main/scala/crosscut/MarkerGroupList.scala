package crosscut

import typings.obsidian.mod
import typings.obsidian.mod.FileSystemAdapter

import scala.scalajs.js.Dynamic.literal as l
import utils.Utils

import scala.collection.mutable
import concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Success, Failure}

/**
 * # object MarkerGroupList
 * Create a table of markers to the marker file.
 */
object MarkerGroupList:

  private type DOCNAME  = String
  private type DOCNAMES = mutable.HashSet[String]
  private type MARKER   = String

  /**
   * # MarkerGroupList
   * Create a table of marker and files that the markers appear in ^marker-00
   *
   * @param app
   * @param markerFile
   * @param documentFolder
   */
  def apply(app: mod.App, markerFile : String, documentFolder: String): Unit =
    val fsa = app.vault.adapter.asInstanceOf[FileSystemAdapter]
    val vaultPath = fsa.getBasePath()
    val markerFileNameWithPath = s"${markerFile}/marker-table.md"
    //
    // some containers to use later on
    //
    val markerToDocumentMap = mutable.HashMap[MARKER, DOCNAMES]()
    val allSolutionFiles = mutable.ArrayBuffer[MARKER]()
    //
    // get all the doc files to scan
    //
    val documentFiles = Utils.listMDFilesInVault(fsa, documentFolder)
    //
    // pick up all markers in the doc string doc file by doc file and aggregate the markers
    // before processing them
    //
    val allFutures = mutable.ListBuffer[Future[Unit]]()

    documentFiles.foreach(docFile =>

      allFutures += fsa.read(docFile).toFuture.map(fileContent =>

        val markersMatch = Utils.markerRegExp.findAllMatchIn(fileContent)
        val markersPerDocument = markersMatch.map(marker => fileContent.substring(marker.start, marker.end).trim).toList

        markersPerDocument.foreach(marker =>
          if !markerToDocumentMap.contains(marker) then
            markerToDocumentMap += (marker -> mutable.HashSet[String]())
          markerToDocumentMap(marker) += docFile
        )
      )
    )
    //
    // wait for all work to be done
    //
    val waitingForFutures : Future[List[Unit]] = Future.sequence(allFutures.toList)

    waitingForFutures.onComplete{
      case Success(_) =>
        val allMarkers = markerToDocumentMap
          .keys
          .toList
          .sortWith((s1, s2) =>
            s1 < s2
          )

        val mdString = StringBuilder(s"|marker|document|\n")
        mdString ++= s"|------|--------|\n"
        allMarkers.foreach(marker =>
          val docNameSet = markerToDocumentMap(marker)
          //
          // build marker to doc entry from the set of document names.
          //
          docNameSet.foreach(docName =>
            mdString ++= s"|${marker.drop(1)}|[[$docName#$marker]]\n"
          )
        )
        //
        // write of the solution text
        //
        Utils.makeDirInVault(fsa, markerFileNameWithPath)
        fsa.write(markerFileNameWithPath, mdString.toString()).toFuture.foreach(Unit => ())
      case Failure(ex) => println(s"Failed to complete all futures: ${ex.getMessage}")
    }
