import docscanner.ScanSource
import org.scalajs.dom
import org.scalajs.dom.{HTMLSpanElement, MouseEvent}
import typings.electron.Electron.ReadBookmark
import typings.obsidian.mod.{App, Menu, Modal, Notice, Plugin, PluginManifest, PluginSettingTab, Setting, TextComponent, ViewState, WorkspaceLeaf}
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
  var docFQNStart: String = js.native
/**
 * The sample plugin
 *
 */
@JSExportTopLevel("TestObsidianPlugin")
class TestObsidianPlugin(app: App, manifest : PluginManifest) extends Plugin(app, manifest):

  var settings : TestObsidianPluginSettings = _
  var intervalHandle : Option[SetIntervalHandle] = None

  override def onload(): Unit =
    loadSettings()

    addSettingTab(TestObsidianPluginSettingsTab(app, this))

    var sbItem = addStatusBarItem()
    sbItem.setText("Comment scanner OFF")

    addRibbonIcon("dice",
     "Comment Scanner",
      (me) =>
        //
        // first make sure that config has been done
        //
        if settings.appPath.equalsIgnoreCase("UNDEFINED") ||
          settings.docPath.equalsIgnoreCase("UNDEFINED") ||
          settings.docFQNStart.equalsIgnoreCase("UNKNOWN") then
          Notice("Please configure code scanner before starting it.", 0.0)
        else
          //
          // activate scanner
          //
          if intervalHandle.isEmpty then
            sbItem.setText("Comment scanner ON")
            intervalHandle = Some(ScanSource(app, settings.appPath,settings.appExt,settings.docFQNStart,settings.docPath,settings.sleepLen))
          else
            sbItem.setText("Comment scanner OFF")
            clearInterval(intervalHandle.get)
            intervalHandle = None
    )

  override def onunload() : Unit =
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
        docFQNStart = "UNKNOWN"
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
          .setName("Source search segment")
          .setDesc("Source path segment where the doc name must be constructed from")
          .addText(text => text
            .setPlaceholder("Enter the segment string")
            .setValue(this.plugin.settings.docFQNStart)
            .onChange(value =>
              plugin.settings.docFQNStart = value
              plugin.saveSettings()
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

/**
 * dummy main object
 */
object ObsidianExportMain {
  def main(args: Array[String]): Unit = {
    js.Dynamic.global.module.exports = js.constructorOf[TestObsidianPlugin]
  }
}
