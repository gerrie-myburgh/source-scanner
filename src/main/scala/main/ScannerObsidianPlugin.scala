package main

import crosscut.{CrossCuttingConcerns, MarkerGroupList}
import docscanner.ScanSource
import typings.node.fsMod
import typings.node.fsMod.MakeDirectoryOptions
import typings.obsidian.mod.*
import utils.Utils

import scala.scalajs.js
import scala.scalajs.js.annotation.JSExportTopLevel
import scala.scalajs.js.timers.{SetIntervalHandle, clearInterval}
import scala.scalajs.js.Dynamic.literal as l

import concurrent.ExecutionContext.Implicits.global
/**
 * # class ScannerObsidianPlugin
 * The main class and entry point of the scanner plugin
 */
@JSExportTopLevel("ScannerObsidianPlugin")
class ScannerObsidianPlugin(app: App, manifest: PluginManifest) extends Plugin(app, manifest):
  private val UNDEFINED = "UNDEFINED"

  var settings: TestObsidianPluginSettings = _
  var intervalHandle: Option[SetIntervalHandle] = None

  /**
   * ## onload()
   * Load the plugin and setup the commands. ^local-ghosts-01
   * 1. Add a command to trigger the creation of solution files. Make sure all configs have been done before running the command
   * 2. Add ribbon command to toggle scanning _ON_ or _OFF_. Make sure the scanner have been configured before starting it.
   */
  override def onload(): Unit =
    println("load plugin source-scanner")
    loadSettings()

    val fsa = app.vault.adapter.asInstanceOf[FileSystemAdapter]
    addSettingTab(ScannerPluginSettingsTab(app, this))

    val sbItem = addStatusBarItem()
    sbItem.setText("Comment scanner OFF")

    addCommand(
      Command(
        id = "solution-files-create",
        name = "Create solution files")
        .setCallback(() =>
          if settings.documentPath.equalsIgnoreCase(UNDEFINED) then
            Notice("Please configure solution scanner portion before using it.", 0.0)
          else
            val (settingsStoryFolder: String, settingsSolutionFolder: String, settingsMarkerMapping: String, settingsCommentsMapping: String) = Utils.createFolders(settings, fsa)

            CrossCuttingConcerns(app, settingsStoryFolder, settingsSolutionFolder, settingsCommentsMapping, settingsMarkerMapping)
        )
    )

    addCommand(
      Command(
        id = "marker-files-create",
        name = "Create a file of markers")
        .setCallback(() =>
          val (settingsStoryFolder: String, settingsSolutionFolder: String, settingsMarkerMapping: String, settingsCommentsMapping: String) = Utils.createFolders(settings, fsa)

          MarkerGroupList(app, settingsMarkerMapping, settingsCommentsMapping)
        )
    )

    addRibbonIcon("view",
      "Comment Scanner",
      me =>
        //
        // first make sure that config has been done
        //
        if settings.applicationPath.equalsIgnoreCase(UNDEFINED) ||
          settings.documentPath.equalsIgnoreCase(UNDEFINED) then
          Notice("Please configure code scanner before starting it.", 0.0)
        else
          //
          // activate scanner
          //
          val (settingsStoryFolder: String, settingsSolutionFolder: String, settingsMarkerMapping: String, settingsCommentsMapping: String) = createFolders(settings, fsa)

          if intervalHandle.isEmpty then
            sbItem.setText("Comment scanner ON")
            intervalHandle = Some(
              ScanSource(app,
                settings.applicationPath,
                settings.applicationExtension,
                settingsCommentsMapping,
                settings.sleepLength,
                settings.groupBySize,
                settings.gitBranchToScan))
          else
            sbItem.setText("Comment scanner OFF")
            clearInterval(intervalHandle.get)
            intervalHandle = None
    )

  /**
   * ## onunload()
   * If the scanner is running then shut it down and unload the plugin
   */
  override def onunload(): Unit =
    println("unload plugin source-scanner")
    if intervalHandle.isDefined then
      clearInterval(intervalHandle.get)
      intervalHandle = None

  /**
   * ## loadsettings()
   * Load settings from the file system. If some of the settings are unknown then use defaults.
   */
  private def loadSettings(): Unit =
    val data = loadData().toFuture
    data.map(any =>

      val default = l(
        applicationPath = UNDEFINED,
        gitBranchToScan = "master",
        documentPath = UNDEFINED,
        applicationExtension = UNDEFINED,
        sleepLength = 1000,
        groupBySize = 10
      )

      settings = js.Object.assign(
        default, any.asInstanceOf[js.Object]
      ).asInstanceOf[TestObsidianPluginSettings]

    )

  def saveSettings(): Unit =
    saveData(settings).toFuture.foreach(Unit => ())

  private def createFolders(settings: TestObsidianPluginSettings, fsa: FileSystemAdapter): (String, String, String, String) =

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
