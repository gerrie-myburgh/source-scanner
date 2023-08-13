package utils

import docscanner.ScanSource.path
import org.scalajs.dom.window.alert

import scala.collection.mutable
import scalajs.js.Dynamic.global as g
import scalajs.js
import typings.node.fsMod
import typings.node.fsMod.{MakeDirectoryOptions, PathLike}
import typings.obsidian.mod.FileSystemAdapter

import js.Dynamic.literal as l

import main.TestObsidianPluginSettings

/**
 * # object Utils
 * General utilities reused across other objects
 */
object Utils:
  private val path = g.require("path")
  val separator : String = path.sep.asInstanceOf[String]
  val markerRegExp = """( |\t)\^([a-zA-Z0-9]+\-)*[a-zA-Z0-9]+\-[0-9]+""".r
  val fileAndPathExp = s"""([a-zA-Z0-9 -]+${
    if separator.equalsIgnoreCase("""\""") then """\\""" else """/"""
  })*[a-zA-Z0-9 -]+""".r

  //
  // The name of the file location of the current-branch.txt file
  //
  var branchNameLocation : Option[String] = None

  //
  // make sure the separator regex does not have single '\'
  //
  def separatorRegEx: String =
    if separator.equalsIgnoreCase("""\""") then """\\""" else """/"""

  /**
   * ## getBranchNameFileLocation
   * Traverse from the tail of the app path to the root looking for the .git folder. location
   *
   * @param appPath to start the scan from
   * @return - true of found false if not found
   */
  def getBranchNameFileLocation(appPath : String) : Boolean =
    var path = appPath.split(separatorRegEx)
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
   * ## makeDirInVault
   * Make a folder path in the vault
   *
   * @param fsa
   * @param filePathAndName
   */
  def makeDirInVault(fsa: FileSystemAdapter, filePathAndName : String): Unit =
    var path = filePathAndName.split(separatorRegEx).dropRight(1)
    val constructedPath = mutable.ListBuffer[String]()
    while
      path.nonEmpty
    do
      constructedPath += path(0)
      fsa.mkdir(constructedPath.mkString("/"))
      path = path.drop(1).toArray

  /**
   * ## listMDFilesInVault
   * Get all md files names  below dir recursively
   *
   * @param dir the start folder
   * @return list of files contained in dir
   */
  def listMDFilesInVault(fsa: FileSystemAdapter, dir: String): List[String] =

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
      val basePath = s"${fsa.getBasePath()}$separator"

      walkRecurse(s"$basePath${dir.trim}")
      files
        .filter(fileName => fileName.endsWith(".md"))
        .map(fileName => fileName.drop(basePath.length).replace(separator, "/"))
        .toList
    } catch {
      case ex: js.JavaScriptException =>
        alert(s"Invalid file path $dir")
        List[String]()
    }

  /**
   * ## walkInVault
   * Recursive wald the folder in a non vault location
   *
   * @param fsa
   * @param dir
   * @return
   */
  def walkInVault(fsa : FileSystemAdapter, dir: String): List[String] =

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
      walkRecurse(s"${fsa.getBasePath()}$separator${dir.trim}")
      files.toList
    } catch {
      case ex: js.JavaScriptException =>
        alert(s"Invalid file path $dir")
        List[String]()
    }

  /**
   * ## walk
   * Get all files below dir recursively using node calls
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
      alert(s"Invalid file path $dir")
      List[String]()
    }

  /**
   * ## getAllFolderNames
   * Get all folder names in the current location
   *
   * @param dir the start folder
   * @return list of files contained in dir
   */
  private def getAllFolderNames(dir: String): List[String] =

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
        alert(s"Invalid file path $dir")
        List[String]()
    }

  /**
   * ## createFolders
   * Create folder below document path
   *
   * @param settings that was set by user
   * @param fsa the file system adaptor
   * @return a tuple of folder names
   */
  def createFolders(settings: TestObsidianPluginSettings, fsa: FileSystemAdapter): (String, String, String, String) =

    val settingsBase1 = s"${fsa.getBasePath()}${Utils.separator}${settings.documentPath}${Utils.separator}"
    val settingsStoryFolder1 = settingsBase1 + "stories"
    val settingsSolutionFolder1 = settingsBase1 + "solutions"
    val settingsMarkerMapping1 = settingsBase1 + "marker"
    val settingsCommentsMapping1 = settingsBase1 + "comments"
    //
    // create folders in vault
    //
    fsMod.mkdirSync(settingsStoryFolder1, l(recursive = true).asInstanceOf[MakeDirectoryOptions])
    fsMod.mkdirSync(settingsSolutionFolder1, l(recursive = true).asInstanceOf[MakeDirectoryOptions])
    fsMod.mkdirSync(settingsMarkerMapping1, l(recursive = true).asInstanceOf[MakeDirectoryOptions])
    fsMod.mkdirSync(settingsCommentsMapping1, l(recursive = true).asInstanceOf[MakeDirectoryOptions])

    val settingsBase = s"${settings.documentPath}${Utils.separator}"
    val settingsStoryFolder = settingsBase + "stories"
    val settingsSolutionFolder = settingsBase + "solutions"
    val settingsMarkerMapping = settingsBase + "marker"
    val settingsCommentsMapping = settingsBase + "comments"

    (settingsStoryFolder, settingsSolutionFolder, settingsMarkerMapping, settingsCommentsMapping)

