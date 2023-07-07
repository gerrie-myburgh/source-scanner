import crosscut.CrossCuttingConcerns
import docscanner.ScanSource
import org.scalajs.dom
import org.scalajs.dom.{HTMLSpanElement, MouseEvent}
import typings.electron.Electron.ReadBookmark
import typings.obsidian.mod.{App, Command, Menu, Modal, Notice, Plugin, PluginManifest, PluginSettingTab, Setting, TextComponent, ViewState}
import typings.obsidian.obsidianStrings
import typings.obsidian.publishMod.global.HTMLElement
import typings.std.{IArguments, Partial, global}
import utils.Utils.VIEW_TYPE_EXAMPLE

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

@js.native
trait TestObsidianPluginSettings extends  js.Object:
  var appPath : String = js.native
  var docPath : String = js.native
  var appExt  : String = js.native
  var sleepLen: Int    = js.native
  var groupBySize : Int = js.native
  var storyFolder : String = js.native
  var solutionFolder : String = js.native
  var markerMappings : String = js.native
/**
 * The sample plugin
 *
 */
@JSExportTopLevel("TestObsidianPlugin")
class TestObsidianPlugin(app: App, manifest : PluginManifest) extends Plugin(app, manifest):

  var settings : TestObsidianPluginSettings = _
  var intervalHandle : Option[SetIntervalHandle] = None

  override def onload(): Unit =
    println("load plugin source-scanner")
    loadSettings()

    addSettingTab(TestObsidianPluginSettingsTab(app, this))

    val sbItem = addStatusBarItem()
    sbItem.setText("Comment scanner OFF")

    addCommand(
      Command(
        id = "solution-files-create",
        name = "Create solution files")
        .setCallback( () =>
          if settings.docPath.equalsIgnoreCase("UNDEFINED") ||
            settings.storyFolder.equalsIgnoreCase("UNDEFINED") ||
            settings.solutionFolder.equalsIgnoreCase("UNDEFINED") then
            Notice("Please configure solution scanner portion before using it.", 0.0)
          else
            CrossCuttingConcerns(app, settings.storyFolder, settings.solutionFolder, settings.docPath, settings.markerMappings)
        )
    )

    addRibbonIcon("view",
     "Comment Scanner",
      me =>
        //
        // first make sure that config has been done
        //
        if settings.appPath.equalsIgnoreCase("UNDEFINED") ||
          settings.docPath.equalsIgnoreCase("UNDEFINED") then
          Notice("Please configure code scanner before starting it.", 0.0)
        else
          //
          // activate scanner
          //
          if intervalHandle.isEmpty then
            sbItem.setText("Comment scanner ON")
            intervalHandle = Some(
              ScanSource(app,
                settings.appPath,
                settings.appExt,
                settings.docPath,
                settings.sleepLen,
                settings.groupBySize))
          else
            sbItem.setText("Comment scanner OFF")
            clearInterval(intervalHandle.get)
            intervalHandle = None
    )

  override def onunload() : Unit =
    println("unload plugin source-scanner")
    if intervalHandle.isDefined then
      clearInterval(intervalHandle.get)
      intervalHandle = None

    app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE)

  private def loadSettings() : Unit =
    val data = loadData().toFuture
    data.map(any =>

      val default = l(
        appPath = "UNDEFINED",
        docPath = "UNDEFINED",
        appExt  = ".java",
        sleepLen = 1000,
        docFQNStart = "UNKNOWN",
        groupBySize = 10,
        storyFolder = "UNDEFINED",
        solutionFolder = "UNDEFINED",
        markerMappings = "UNDEFINED"
      )

      settings = js.Object.assign(
        default, any.asInstanceOf[js.Object]
      ).asInstanceOf[TestObsidianPluginSettings]

    )

  def saveSettings() : Unit =
    saveData(settings).toFuture.foreach(Unit => ())

/**
 * The interface to the settings of the TestObsidian plugin
 * @param app of node
 * @param plugin using the settings
 */
class TestObsidianPluginSettingsTab(app : App, val plugin : TestObsidianPlugin) extends PluginSettingTab(app, plugin):

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
          .setValue(this.plugin.settings.appPath)
          .onChange(value =>
            plugin.settings.appPath = value
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
              plugin.settings.appPath = pathName.toString
              plugin.saveSettings()
              appPathSetting.components.first().get.asInstanceOf[TextComponent].setValue(pathName.toString)
          )
        )

      Setting(containerElement)
          .setName("Documentation Path")
          .setDesc("Path to document workspace relative from vault")
          .addText(text => text
            .setPlaceholder("Enter the documentation path")
            .setValue(this.plugin.settings.docPath)
            .onChange(value =>
              plugin.settings.docPath = value
              plugin.saveSettings()
            )
          )

      Setting(containerElement)
        .setName("Application type")
        .setDesc("Type of application (.java .js etc)")
        .addText(text => text
          .setPlaceholder("Enter the application extension")
          .setValue(this.plugin.settings.appExt)
          .onChange(value =>
            plugin.settings.appExt = value
            plugin.saveSettings()
          )
        )

      Setting(containerElement)
        .setName("Activation interval")
        .setDesc("Activation interval in ms")
        .addText(text => text
          .setPlaceholder("Enter the activation interval")
          .setValue(this.plugin.settings.sleepLen.toString)
          .onChange(value =>

            val intValue = try {
              (if value.isEmpty then "0" else value).toInt
            } catch {
              case i : js.JavaScriptException => 1000
            }

            plugin.settings.sleepLen = intValue
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
/**
 * dummy main object
 */
object ObsidianExportMain {
  def main(args: Array[String]): Unit = {
    js.Dynamic.global.module.exports = js.constructorOf[TestObsidianPlugin]
  }
}
