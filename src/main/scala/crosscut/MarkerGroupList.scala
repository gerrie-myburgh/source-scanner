package crosscut

import typings.node.anon.ObjectEncodingOptionsflagEncoding
import typings.node.fsMod
import typings.obsidian.mod
import typings.obsidian.mod.FileSystemAdapter

import scala.scalajs.js.Dynamic.literal as l
import utils.Utils

import scala.collection.mutable

/**
 * # object MarkerGroupList
 * Create a table of markers to the marker file.
 */
object MarkerGroupList:

  private type DOCNAME  = String
  private type DOCNAMES = mutable.HashSet[String]
  private type MARKER   = String

  def apply(app: mod.App, markerFile : String, documentFolder: String): Unit =
    val fsa = app.vault.adapter.asInstanceOf[FileSystemAdapter]
    val vaultPath = fsa.getBasePath()
    val markerFileNameWithPath = s"$vaultPath${Utils.separator}$markerFile.md"
    //
    // some containers to use later on
    //
    val markerToDocumentMap = mutable.HashMap[MARKER, DOCNAMES]()
    val allSolutionFiles = mutable.ArrayBuffer[MARKER]()
    //
    // get all the doc files to scan
    //
    val documentFiles = Utils.walkInVault(fsa, documentFolder).filter(name => name.endsWith(".md")).toList
    //
    // pick up all markers in the doc string doc file by doc file and aggregate the markers
    // before processing them
    //
    val markerlist = mutable.ListBuffer[String]()
    documentFiles.foreach(docFile =>
      val fileContent = fsMod.readFileSync(docFile, l(encoding = "utf8", flag = "r")
        .asInstanceOf[ObjectEncodingOptionsflagEncoding])
        .asInstanceOf[String]

      val markersMatch = Utils.markerRegExp.findAllMatchIn(fileContent)
      val markersPerDocument = markersMatch.map(marker => fileContent.substring(marker.start, marker.end).trim).toList

      markerlist ++= markersPerDocument

      val docName = docFile.split(Utils.separatorRegEx).last

      markersPerDocument.foreach(marker =>
        if !markerToDocumentMap.contains(marker) then
          markerToDocumentMap += (marker -> mutable.HashSet[String]())
        markerToDocumentMap(marker) +=  docName
      )
    )
    //
    // collect all markers in one list
    // sort them by marker name
    //
    val allMarkers = markerToDocumentMap
      .keys
      .toList
      .sortWith((s1, s2) =>
        s1 < s2
      )
    //
    // write out the sorted markers. Make sure the path exist
    //
    val pathToCreate = markerFileNameWithPath.split(Utils.separatorRegEx).dropRight(1).mkString(Utils.separator)
    fsMod.mkdirSync(pathToCreate, l(recursive = true).asInstanceOf[fsMod.MakeDirectoryOptions])

    val mdString = StringBuilder(s"|marker|document|\n")
    mdString ++=                 s"|------|--------|\n"
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
    fsMod.writeFile(markerFileNameWithPath, mdString.toString(), err => ())
