package crosscut

import docscanner.ScanSource.docPath
import typings.node.fsMod
import utils.Utils

import scala.collection.immutable.HashSet
import scala.collection.mutable
import scala.scalajs.js
import scala.scalajs.js.Dynamic.literal as l

object CrossCuttingConcerns:

  private type DOCNAME   = String
  private type DOCSTRING = String
  private type MARKER    = String
  private type SOLNAME   = String
  private type PATHNAME  = String

  private val markerRegExp = """( |\t|^)\^([a-zA-Z0-9]+\-)*[a-zA-Z0-9]+\-[0-9]+""".r
  def apply(storyFolder : String,  solutionFolder : String, docStings : Map[DOCNAME, DOCSTRING]) : Unit =

    val markerToDocMap     = mutable.HashMap[MARKER, DOCNAME]()
    val docToMarkerMap     = mutable.HashMap[DOCNAME, List[MARKER]]()
    val solToMarkerMap     = mutable.HashMap[SOLNAME, List[MARKER]]()
    val allSolutionFiles   = mutable.HashSet[MARKER]()
    //
    // pick up all markers in the doc string
    //
    docStings.foreach( ( docName : DOCNAME, str : DOCSTRING )  =>
      val markersMatch = markerRegExp.findAllMatchIn(str)
      val markerList = markersMatch.map(marker => str.substring(marker.start, marker.end).trim).toList

      val allLocalMarkerNames = markerList.map(marker =>
        marker.drop(1).split("-").dropRight(1).mkString("-")
      ).toSet.asInstanceOf[Set[MARKER]]

      allSolutionFiles ++= allLocalMarkerNames

      markerList.foreach(marker =>
        markerToDocMap += (marker.asInstanceOf[MARKER] -> docName)
      )

      docToMarkerMap += (docName -> markerList)
    )
    //
    // make sure the paths exist for every solutions file
    //
    allSolutionFiles.foreach(file =>
      val solFile =  solutionPathFromMarker(solutionFolder, file)
      fsMod.mkdirSync(solFile, l(recursive =  true).asInstanceOf[fsMod.MakeDirectoryOptions])
    )

    //
    // collect all markers in one list and group by path/name.md excluding the seq number
    //
    val allMarkers = docToMarkerMap.values.toList.flatten.groupBy(by => solutionDocNameFromMarker(solutionFolder, by))
    //
    // todo sort marker lists by number
    //

    //
    // write out
    //
    allMarkers.foreach( ( solName, markers ) =>
      //
      // build link to story
      //
      val mdString = StringBuilder(s"""![[$storyFolder${Utils.separator}${getStoryFileName(solName.dropRight(3))}#^summary]]\n""".stripMargin)
      markers.foreach(marker =>
        //
        // build kinks to document thread
        //
        mdString ++= s"""![[${markerToDocMap(marker)}#${marker}]]\n"""
      )
      //
      // remove solution file it exists and recreate with new values
      //
      // debug
      println(solName)
      fsMod.writeFile(solName, mdString.toString(), err => ())

    )

  private def getStoryFileName(solName : SOLNAME) : String =
    solName.split("/").drop(1).mkString("/")

  /**
   * Take a marker string and convert into file path / file name.md
   * @param marker in document string
   * @return
   */
  private def solutionDocNameFromMarker(solFolder : String, marker : String): SOLNAME =
    val markerStr = marker.drop(1)
    val markerList = markerStr.split("-")
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
