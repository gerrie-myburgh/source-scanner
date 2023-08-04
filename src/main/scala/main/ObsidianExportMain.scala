package main

import scala.scalajs.js

/*
 * dummy main object
 */
object ObsidianExportMain {
  def main(args: Array[String]): Unit = {
    js.Dynamic.global.module.exports = js.constructorOf[ScannerObsidianPlugin]
  }
}
