package utils

import docscanner.ScanSource.path

import org.scalajs.dom.window.alert

import scala.collection.mutable
import scalajs.js.Dynamic.global as g
import scalajs.js

import typings.node.fsMod
import typings.node.fsMod.PathLike

/**
 * # object Utils
 * General utilities reused across other objects
 */
object Utils:
  private val path = g.require("path")
  val separator : String = path.sep.asInstanceOf[String]
  val markerRegExp = """( |\t)\^([a-zA-Z0-9]+\-)*[a-zA-Z0-9]+\-[0-9]+""".r
  val fileAndPathExp = s"""([a-zA-Z0-9 -]+${separator})*[a-zA-Z0-9 -]+""".r

  //
  // The name of the file location of the current-branch.txt file
  //
  var branchNameLocation : Option[String] = None

  /**
   * ## getBranchNameFileLocation
   * Traverse from the tail of the app path to the root looking for the .git folder. location
   * @param appPath
   * @Return - true of found false if not found
   */
  def getBranchNameFileLocation(appPath : String) : Boolean =
    var path = appPath.split(separator)
    while
      val folderNames = getAllFolderNames(path.mkString(separator))
      path.length > 1 && folderNames.nonEmpty && !folderNames.exists(_.endsWith(".git"))
    do
      path = path.dropRight(1)

    if path.length > 1 then
      branchNameLocation = Some(path.mkString(separator))
      true
    else
      branchNameLocation = None
      false

  /**
   * ## walk
   * Get all files below dir recursively
   *
   * @param dir the start folder
   * @return list of files contained in dir
   */
  def walk(dir: String): List[String] =

    val files = mutable.ListBuffer[String]()

    def walkRecurse(dir: String): Unit =
      val dirFiles = fsMod.readdirSync(dir).toList
      dirFiles.foreach(file => {
        val p = path.join(dir, file).asInstanceOf[PathLike]
        val stat = fsMod.lstatSync(p)
        if stat.get.isDirectory() then
          walkRecurse(s"$dir$separator$file")
        else
          files += s"$dir$separator$file"
      })

    try {
      walkRecurse(dir.trim)
      files.toList
    } catch { case ex : js.JavaScriptException =>
      alert("Invalid file path")
      List[String]()
    }

  /**
   * ## getAllFolderNames
   * Get all folder names in the current location
   *
   * @param dir the start folder
   * @return list of files contained in dir
   */
  def getAllFolderNames(dir: String): List[String] =

    val files = mutable.ListBuffer[String]()

    def walkRecurse(dir: String): Unit =
      val dirFiles = fsMod.readdirSync(dir).toList
      dirFiles.foreach(file => {
        val p = path.join(dir, file).asInstanceOf[PathLike]
        val stat = fsMod.lstatSync(p)
        if stat.get.isDirectory() then
          files += s"$dir$separator$file"
      })

    try {
      walkRecurse(dir.trim)
      files.toList
    } catch {
      case ex: js.JavaScriptException =>
        alert("Invalid file path")
        List[String]()
    }

