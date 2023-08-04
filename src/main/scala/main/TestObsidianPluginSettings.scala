package main

import scala.scalajs.js

//
//bus All the variables have been parameterised and is user changeable. ^story2-00
//bus
//bus The variables are all updatable in _ScannerPluginSettingsTab_ ^story1-02
//
@js.native
trait TestObsidianPluginSettings extends js.Object:
  var applicationPath: String = js.native
  var gitBranchToScan: String = js.native
  var documentPath: String = js.native
  var applicationExtension: String = js.native
  var sleepLength: Int = js.native
  var groupBySize: Int = js.native
