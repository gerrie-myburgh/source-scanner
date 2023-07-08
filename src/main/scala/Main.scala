import crosscut.{CrossCuttingConcerns, MarkerGroupList}
import docscanner.ScanSource
import org.scalajs.dom
import org.scalajs.dom.window.alert
import org.scalajs.dom.{HTMLSpanElement, MouseEvent}
import typings.electron.Electron.ReadBookmark
import typings.obsidian.mod.{App, Command, Menu, Modal, Notice, Plugin, PluginManifest, PluginSettingTab, Setting, TextComponent, ViewState}
import typings.obsidian.obsidianStrings
import typings.obsidian.publishMod.global.HTMLElement
import typings.std.{IArguments, Partial, global}
import utils.Utils

import scala.concurrent.Future
import scala.scalajs.js
import scala.scalajs.js.timers.*
import js.annotation.*
import js.JSConverters.*
import js.Dynamic.literal as l
import js.Dynamic.global as g
import scala.util.{Failure, Success}
import scala.scalajs.js.timers.SetIntervalHandle
import concurrent.ExecutionContext.Implicits.global
import scala.language.postfixOps

//
//bus All the variables have been parameterised and is user changeable. ^story2-00
//bus
//bus The variables are all updatable in _ScannerPluginSettingsTab_ ^story1-02
//
@js.native
trait TestObsidianPluginSettings extends  js.Object:
  var applicationPath : String = js.native
  var gitBranchToScan : String = js.native
  var documentPath : String = js.native
  var applicationExtension  : String = js.native
  var sleepLength: Int    = js.native
  var groupBySize : Int = js.native
  var storyFolder : String = js.native
  var solutionFolder : String = js.native
  var markerMappings : String = js.native
  var markersPath : String = js.native

/**
 * # class ScannerObsidianPlugin
 * The main class and entry point of the scanner plugin
 */
@JSExportTopLevel("ScannerObsidianPlugin")
class ScannerObsidianPlugin(app: App, manifest : PluginManifest) extends Plugin(app, manifest):
  private val UNDEFINED = "UNDEFINED"
  
  var settings : TestObsidianPluginSettings = _
  var intervalHandle : Option[SetIntervalHandle] = None

  /**
   * ## onload()
   * Load the plugin and setup the commands
   * 1. Add a command to trigger the creation of solution files. Make sure all configs have been done before running the command
   * 2. Add ribbon command to toggle scannin _ON_ or _OFF_. Make sure the scanner have been configured before starting it.
   */
  override def onload(): Unit =
    println("load plugin source-scanner")
    loadSettings()

    addSettingTab(ScannerPluginSettingsTab(app, this))

    val sbItem = addStatusBarItem()
    sbItem.setText("Comment scanner OFF")

    addCommand(
      Command(
        id = "solution-files-create",
        name = "Create solution files")
        .setCallback( () =>
          if settings.documentPath.equalsIgnoreCase(UNDEFINED) ||
            settings.storyFolder.equalsIgnoreCase(UNDEFINED) ||
            settings.solutionFolder.equalsIgnoreCase(UNDEFINED) then
            Notice("Please configure solution scanner portion before using it.", 0.0)
          else
            CrossCuttingConcerns(app, settings.storyFolder, settings.solutionFolder, settings.documentPath, settings.markerMappings)
        )
    )

    addCommand(
      Command(
        id = "marker-files-create",
        name = "Create a file of markers")
        .setCallback(() =>
          MarkerGroupList(app, settings.markersPath, settings.documentPath)
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
          if intervalHandle.isEmpty then
            sbItem.setText("Comment scanner ON")
            intervalHandle = Some(
              ScanSource(app,
                settings.applicationPath,
                settings.applicationExtension,
                settings.documentPath,
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
  override def onunload() : Unit =
    println("unload plugin source-scanner")
    if intervalHandle.isDefined then
      clearInterval(intervalHandle.get)
      intervalHandle = None

  /**
   * ## loadsettings()
   * Load settings from the file system. If some of the settings are unknown then use defaults.
   */
  private def loadSettings() : Unit =
    val data = loadData().toFuture
    data.map(any =>

      val default = l(
        applicationPath = UNDEFINED,
        gitBranchToScan = "master",
        documentPath = UNDEFINED,
        applicationExtension = UNDEFINED,
        sleepLength = 1000,
        groupBySize = 10,
        storyFolder = UNDEFINED,
        solutionFolder = UNDEFINED,
        markerMappings = "",
        markersPath = "marker-file"
      )

      settings = js.Object.assign(
        default, any.asInstanceOf[js.Object]
      ).asInstanceOf[TestObsidianPluginSettings]

    )

  def saveSettings() : Unit =
    saveData(settings).toFuture.foreach(Unit => ())

/**
 * # class ScannerPluginSettingsTab
 * The interface to the settings of the scanner plugin. All the values are set up here.
 * @param app of node
 * @param plugin using the settings
 */
class ScannerPluginSettingsTab(app : App, val plugin : ScannerObsidianPlugin) extends PluginSettingTab(app, plugin):
  private val UNDEFINED = "UNDEFINED"

  /**
   * ## display()
   * Allow the user to set the parameters
   */
  override def display() : Unit =

    val containerElement = this.containerEl

    containerElement.empty()

    if plugin.intervalHandle.isDefined then
      Setting(containerElement)
        .setName("Scanner is running")
        .setDesc("Please shutdown the scanner before updating the settings")
    else
      val appPathSetting = Setting(containerElement)

      appPathSetting
        .setName("Application Path")
        .setDesc("Path to application workspace")
        .addText(text => text
          .setPlaceholder("Enter the application path")
          .setValue(this.plugin.settings.applicationPath)
          .onChange(value =>

            if Utils.getBranchNameFileLocation(value) then
              alert(s" git found in ${Utils.branchNameLocation.get}")
            else
              alert(s"git not found in app path.")

            plugin.settings.applicationPath = value
            plugin.saveSettings()
          )
        )
        .addButton(button => button
          .setButtonText("APP PATH")
          .onClick((cb : MouseEvent) =>
            val dlg = g.require("electron").remote.dialog
            val pathName = dlg.showOpenDialogSync(
              l(title = "Source path", properties = js.Array("openDirectory"))
            )
            if !js.isUndefined(pathName) then
              plugin.settings.applicationPath = pathName.toString

              if Utils.getBranchNameFileLocation(pathName.toString) then
                alert(s" git found in ${Utils.branchNameLocation.get}")
              else
                alert(s"git not found in app path.")


              plugin.saveSettings()
              appPathSetting.components.first().get.asInstanceOf[TextComponent].setValue(pathName.toString)
          )
        )

      Setting(containerElement)
        .setName("GIT Branch name")
        .setDesc("The name of the git gitBranchToScan to scan")
        .addText(text => text
          .setPlaceholder("Enter the git gitBranchToScan name")
          .setValue(this.plugin.settings.gitBranchToScan)
          .onChange(value =>
            plugin.settings.gitBranchToScan = value
            plugin.saveSettings()
          )
        )

      Setting(containerElement)
          .setName("Documentation Path")
          .setDesc("Path to document workspace relative from vault")
          .addText(text => text
            .setPlaceholder("Enter the documentation path")
            .setValue(this.plugin.settings.documentPath)
            .onChange(value =>
              plugin.settings.documentPath = value
              plugin.saveSettings()
            )
          )

      Setting(containerElement)
        .setName("Application type")
        .setDesc("Type of application (.java .js etc)")
        .addText(text => text
          .setPlaceholder("Enter the application extension")
          .setValue(this.plugin.settings.applicationExtension)
          .onChange(value =>
            plugin.settings.applicationExtension = value
            plugin.saveSettings()
          )
        )

      Setting(containerElement)
        .setName("Activation interval")
        .setDesc("Activation interval in ms")
        .addText(text => text
          .setPlaceholder("Enter the activation interval")
          .setValue(this.plugin.settings.sleepLength.toString)
          .onChange(value =>

            val intValue = try {
              (if value.isEmpty then "0" else value).toInt
            } catch {
              case i : js.JavaScriptException => 1000
            }

            plugin.settings.sleepLength = intValue
            plugin.saveSettings()
          )
        )

      Setting(containerElement)
        .setName("Number of source files to process")
        .setDesc("Number of source files to process at a time")
        .addText(text => text
          .setPlaceholder("Enter the source file processing count")
          .setValue(this.plugin.settings.groupBySize.toString)
          .onChange(value =>

            val intValue = try {
              (if value.isEmpty then "0" else value).toInt
            } catch {
              case i: js.JavaScriptException => 10
            }

            plugin.settings.groupBySize = intValue
            plugin.saveSettings()
          )
        )


      Setting(containerElement)
        .setName("Story folder")
        .setDesc("Location where all the user stories are kept")
        .addText(text => text
          .setPlaceholder("Enter the story folder location")
          .setValue(this.plugin.settings.storyFolder)
          .onChange(value =>
            plugin.settings.storyFolder = value
            plugin.saveSettings()
          )
        )

      Setting(containerElement)
        .setName("Solution folder")
        .setDesc("Location where all the solutions threads are kept")
        .addText(text => text
          .setPlaceholder("Enter the solution folder location")
          .setValue(this.plugin.settings.solutionFolder)
          .onChange(value =>
            plugin.settings.solutionFolder = value
            plugin.saveSettings()
          )
        )

      Setting(containerElement)
        .setName("Mapping of markers to md file names")
        .setDesc("Mapping definition from marker to md name")
        .addTextArea(text => text
          .setPlaceholder("Enter the mappings")
          .setValue(this.plugin.settings.markerMappings)
          .onChange(value =>
            plugin.settings.markerMappings = value
            plugin.saveSettings()
          )
        )

      Setting(containerElement)
        .setName("Marker list file name")
        .setDesc("File where the markers list will be created into")
        .addText(text => text
          .setPlaceholder("Enter the markers file name")
          .setValue(this.plugin.settings.markersPath)
          .onChange(value =>
            plugin.settings.markersPath = value
            plugin.saveSettings()
          )
        )

      Setting(containerElement)
        .setName("Check variables")
        .setDesc("Check that all variables are defined correctly")
        .addButton(button => button
          .setButtonText("Check values in settings")
          .onClick(cb => checkValues())
          )

  /**
   * ## checkValues
   * Make sure that the settings values are all valid
   * give alert for invalid values
   */
  private def checkValues() : Unit =

    if plugin.settings.applicationPath.isEmpty
      || plugin.settings.applicationPath.equalsIgnoreCase(UNDEFINED) then
      alert("Application path may not be empty or undefined.")
      return ()

    if plugin.settings.applicationPath.endsWith(Utils.separator) then
      plugin.settings.applicationPath = plugin.settings.applicationPath.dropRight(1)

    if plugin.settings.applicationExtension.isEmpty then
      alert("Application extension is not defined.")
      return ()

    if plugin.settings.applicationExtension.length <= 2
      || plugin.settings.applicationExtension.charAt(0) != '.' then
      alert("Application type length must be > 2 and start with '.'.")
      return ()

    val sourceFileList = Utils.walk(plugin.settings.applicationPath)
      .toList
      .filter(_.endsWith(plugin.settings.applicationExtension))
    if sourceFileList.isEmpty then
      alert("There are no source files in the application path.")
      return ()

    if isDefined(plugin.settings.gitBranchToScan, "GIT Branch") then
      return ()

    if isDefined(plugin.settings.documentPath, "Document Path") then
      return ()

    if isDefined(plugin.settings.storyFolder, "Story Folder") then
      return ()

    if isDefined(plugin.settings.solutionFolder, "Solution Folder") then
      return ()

    if isDefined(plugin.settings.markersPath, "Markers Path") then
      return ()

    if plugin.settings.sleepLength <= 500 then
      alert("Sleep length must be greater than 500 milliseconds.")
      return ()

    if plugin.settings.groupBySize <= 0 then
      alert("Group size must be greater than 0")
      return ()

    if plugin.settings.markerMappings.nonEmpty &&
      plugin.settings.markerMappings.split("\r?\n").filter(!_.contains('=')).length > 0 then
      alert("Marker mappings list has a mapping in it without a '=' sign.")
      return ()

    alert("Values seems fine.")
    ()

  private def isDefined(string : String, errorMessage : String) =
    if string.isEmpty || string.equalsIgnoreCase(UNDEFINED) then
      alert(s"${errorMessage} must be defined.")
      true
    else
      false
/*
 * dummy main object
 */
object ObsidianExportMain {
  def main(args: Array[String]): Unit = {
    js.Dynamic.global.module.exports = js.constructorOf[ScannerObsidianPlugin]
  }
}
