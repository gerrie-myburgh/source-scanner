package main

import scala.scalajs.js

/**
 * ## Dummy main object
 * This object is not used by Obsidian
 */
object ObsidianExportMain {
  def main(args: Array[String]): Unit = {
    js.Dynamic.global.module.exports = js.constructorOf[ScannerObsidianPlugin]
  }
}
