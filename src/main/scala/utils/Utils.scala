package utils

import docscanner.ScanSource.path

import scala.collection.mutable
import scalajs.js.Dynamic.global as g
import typings.node.fsMod
import typings.node.fsMod.PathLike

object Utils:
  val VIEW_TYPE_EXAMPLE = "example-view"
  private val path = g.require("path")
  val separator : String = path.sep.asInstanceOf[String]

  /**
   * get all files below dir recursively
   *
   * @param dir the start folder
   * @return list of files contained in dir
   */
  def walk(dir: String): List[String] =

    val files = mutable.ListBuffer[String]()

    def walkRecurse(dir: String): Unit =
      val dirFiles = fsMod.readdirSync(dir).toList
      dirFiles.foreach(file => {
        val p = path.join(dir, file).asInstanceOf[PathLike]
        val stat = fsMod.lstatSync(p)
        if stat.get.isDirectory() then
          walkRecurse(s"$dir$separator$file")
        else
          files += s"$dir$separator$file"
      })

    walkRecurse(dir)
    files.toList



