package main

import org.scalajs.dom.MouseEvent
import typings.obsidian.mod.{App, FileSystemAdapter, PluginSettingTab, Setting}
import utils.Utils
import scalajs.js.Dynamic.global as g
import scala.scalajs.js.Dynamic.literal as l
import scala.scalajs.js
import main.ScannerObsidianPlugin

import org.scalajs.dom.window.alert
/**
 * # class ScannerPluginSettingsTab
 * The interface to the settings of the scanner plugin. All the values are set up here.
 *
 * @param app    of node
 * @param plugin using the settings
 */
class ScannerPluginSettingsTab(app: App, val plugin: ScannerObsidianPlugin) extends PluginSettingTab(app, plugin):
  private val UNDEFINED = "UNDEFINED"

  private val vaultPath = app.vault.adapter.asInstanceOf[FileSystemAdapter].getBasePath()

  /**
   * ## display()
   * Allow the user to set the parameters
   */
  override def display(): Unit =

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
        .setDesc(s"Path to application workspace: ${this.plugin.settings.applicationPath}")
        .addButton(button => button
          .setButtonText("SELECT APPLICATION PATH")
          .onClick((cb: MouseEvent) =>

            val dlg = g.require("electron").remote.dialog
            val pathName = dlg.showOpenDialogSync(
              l(title = "Source path", properties = js.Array("openDirectory"))
            )

            if !js.isUndefined(pathName) then
              plugin.settings.applicationPath = pathName.toString

            if !Utils.getBranchNameFileLocation(pathName.toString) then
              alert(s"git not found in application path.")

            plugin.saveSettings()
            appPathSetting.setDesc(s"Path to application workspace: ${this.plugin.settings.applicationPath}")
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

            var intValue = 1000
            try {
              intValue = try {
                (if value.isEmpty then "0" else value).toInt
              } catch {
                case i: js.JavaScriptException => 1000
              }
            } catch {
              case ex: NumberFormatException =>
                alert("Number is not valid")
                intValue = 1000
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

            var intValue = 1000
            try {
              intValue = try {
                (if value.isEmpty then "0" else value).toInt
              } catch {
                case i: js.JavaScriptException => 1000
              }
            } catch {
              case ex: NumberFormatException =>
                alert("Number is not valid")
                intValue = 1000
            }

            plugin.settings.groupBySize = intValue
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
  private def checkValues(): Unit =

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

    if isInvalidValidFileName(plugin.settings.documentPath, "Document Path") then
      return ()

    if plugin.settings.sleepLength < 500 then
      alert("Sleep length must be greater-equal to 500 milliseconds.")
      return ()

    if plugin.settings.groupBySize <= 0 then
      alert("Group size must be greater than 0")
      return ()

    alert("Values seems fine.")
    ()

  private def isDefined(string: String, errorMessage: String) =
    if string == null || string.isEmpty || string.equalsIgnoreCase(UNDEFINED) then
      alert(s"${errorMessage} must be defined.")
      true
    else
      false

  private def isInvalidValidFileName(fileName: String, displayName: String) =
    if !Utils.fileAndPathExp.matches(fileName) then
      alert(s"$displayName must consist of alpha numeric characters, spaces or '-' separated by ${Utils.separator}.")
      true
    else
      false
