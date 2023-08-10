package main

import scala.scalajs.js

//
//bus All the variables have been parameterised and is user changeable.
//bus All the variabls are js variables
//bus The variables are all updatable in _ScannerPluginSettingsTab_  ^settings-00
//

/**
 * ### Application Path
 * The location on the file system of the source code.
 * ### Git Branch To Scan
 * A string representing the git branch.
 * ### Document Path
 * The location in the vault where all the generated notes are kept.
 * ### Application Extension
 * The type of source. java, scala, js, ts, c, c++ and so on
 * ### Sleep Length
 * Milliseconds to wait until the application runs.
 * ### Group By Size
 * The number of source files to process at a time.
 */
@js.native
trait TestObsidianPluginSettings extends js.Object:
  var applicationPath: String = js.native
  var gitBranchToScan: String = js.native
  var documentPath: String = js.native
  var applicationExtension: String = js.native
  var sleepLength: Int = js.native
  var groupBySize: Int = js.native
