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
/**#ScannerObsidianPlugin
 * uses #Utils #ScanSource #CrossCuttingConcerns #MarkerGroupList
 * # class ScannerObsidianPlugin
 * The main class and entry point of the scanner plugin
 * _onload_ will setup all the callback functions
 * _onunload_ tear down the callback fuctions and shutdown the scanner iff it is running
 * _loadSettings_ load the setting from the file system
 * _saveSettings_ save the setting to file system
 * _createFolders_ create folder if they do not exist ^plugin-00
 */
@JSExportTopLevel("ScannerObsidianPlugin")
class ScannerObsidianPlugin(app: App, manifest: PluginManifest) extends Plugin(app, manifest):
  private val UNDEFINED = "UNDEFINED"

  var settings: TestObsidianPluginSettings = _
  var intervalHandle: Option[SetIntervalHandle] = None

  /**
   * ## onload()
   * Load the plugin and setup the commands.
   * Add a command to trigger the creation of solution files. Make sure all configs have been done before running the command.
   * Add command to create table of markers and the files these markers appear in.
   * Add ribbon command to toggle scanning _ON_ or _OFF_. Make sure the scanner have been configured before starting it. ^plugin-01
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
          val (settingsStoryFolder: String, settingsSolutionFolder: String, settingsMarkerMapping: String, settingsCommentsMapping: String) = Utils.createFolders(settings, fsa)

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
   * If the scanner is running then shut it down and unload the plugin.
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

  /**
   * ## saveSettings
   * Save setting to the file system.
   */
  def saveSettings(): Unit =
    saveData(settings).toFuture.foreach(Unit => ())

