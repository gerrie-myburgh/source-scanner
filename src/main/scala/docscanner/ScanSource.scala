package docscanner

import scala.jdk.CollectionConverters.*
import scala.scalajs.js.timers.SetIntervalHandle
import scalajs.js.timers
import scalajs.js
import scalajs.js.Dynamic.global as g
import js.Dynamic.literal as l
import typings.node.bufferMod.global.Buffer
import typings.node.fsMod
import typings.node.anon.*
import typings.obsidian.mod
import typings.obsidian.mod.FileSystemAdapter
import utils.{Lexer, Utils}

import concurrent.ExecutionContext.Implicits.global
import scala.collection.mutable

//metauses: ["Lexer", "Utils"]
object ScanSource:
  private type DOC = String

  private val path = g.require("path")

  private var gitBranchName : String = _        // the working gitBranchToScan defined in the settings
  private var applicationPath : String = _      // application path
  private var codeExtension : String = _        // the source file name extension
  private var documentPath : String = _         // document path abs path
  private var relativeDocumentPath : String = _ // document path abs rel from vault root
  private var groupBySize : Int = _             // number of documents to process at a time
  //
  //
  private var sleepLength : Int = _             // number of seconds to sleep
  //
  // number of computation phases per iteration
  //
  private var phaseCount = 0                    // the number of the current phase
  //
  // current files with 'ext' extension with paths
  //
  private var applicationFileListWithExtension : List[List[String]] = _
  private var documentFileListWithExtension : List[String] = _

  private val sourceAndDocumentLink = mutable.Set[ DOC ]() // docs that have a source
  private val documentAndContentMap = mutable.HashMap[String, String]() // all documents created with the content

  /**#ScanSource
   * uses #Lexer #Utils
   * ## apply
   * At every sleep length millliseconds interval get all the business rules from the latest source file and write it to the document file. if the
   * source file changes then delete the doc file and get newest comments from the source file ^scanner-00
   *
   * 1. The 2 second interval must be made configurable. - Still to be implemented
   * 2. The following must be configurable
   *    1. Project file location
   *       2. Source file extension e.g. scala or java
   *       3. Relative path from the project file location to the start of the source
   *       4. Relative path of the extracted from the project path to the document location
   *
   * @param app
   * @param _appPath
   * @param _ext
   * @param _work
   * @param _docPath
   * @param _sleepLength
   * @return
   */
  def apply(app : mod.App, _appPath : String, _ext : String, _docPath : String, _sleepLength : Int, _groupBySize : Int, _gitBranchName : String): SetIntervalHandle =
    //
    // initialization
    //
    path.basename("")

    applicationPath = _appPath
    gitBranchName = _gitBranchName
    codeExtension = _ext
    documentPath = _docPath
    relativeDocumentPath = _docPath
    sleepLength = _sleepLength
    groupBySize = _groupBySize
    //
    // make sure the doc path relative from vault exist - if not create this path
    //
    val fsa = app.vault.adapter.asInstanceOf[FileSystemAdapter]
    val vaultPath = fsa.getBasePath()

    timers.setInterval(sleepLength)(this.run(fsa))

  /**
   * ## private def isBranchStillActive() : Boolean =
   * check if the current gitBranchToScan is still the active gitBranchToScan for the scanner
   * if the file does not exist then assume the user wants to use the default code in the application path
   * @return
   */
  private def isBranchStillActive: Boolean =
    if Utils.branchNameLocation.isEmpty then
      Utils.getBranchNameFileLocation(applicationPath)
    if Utils.branchNameLocation.isDefined then
      try {
        val branchName = fsMod.readFileSync(Utils.branchNameLocation.get + Utils.separator + "current-branch.txt", l(encoding = "utf8", flag = "r")
          .asInstanceOf[ObjectEncodingOptionsflagEncoding])
          .asInstanceOf[String]
        if branchName.isEmpty || !branchName.trim.equalsIgnoreCase(gitBranchName.trim) then
          false
        else
          true
      } catch {
        case ex  : js.JavaScriptException => true
      }
    else
      false

  private def run(fsa : FileSystemAdapter) : Unit =
    //
    // if the current gitBranchToScan is the defined gitBranchToScan then go ahead an process else do not process
    //
    if phaseCount == 0 then
      if !isBranchStillActive then return()

    //
    // do work in phases - get all the source files.
    //
    if phaseCount == 1 then
      applicationFileListWithExtension = Utils.walk(applicationPath
        .asInstanceOf[String])
        .filter(file => file.endsWith(codeExtension))
        .grouped(10)
        .toList
    //
    // get list of document files
    //
    if phaseCount == 2 then
      documentFileListWithExtension = Utils.listMDFilesInVault(fsa, documentPath)
    //
    // if the source if younger then the document file then
    //    load the lines from the source file and scan for comments.
    //    write comments out to document file
    //
    if phaseCount == 3 then
      if applicationFileListWithExtension.nonEmpty then
        applicationFileListWithExtension.head.foreach(srcFile =>
          val documentName = createDocNameFromSourceName(srcFile)
          val documentNameAndPath = s"$documentPath/$documentName"

          sourceAndDocumentLink += documentNameAndPath
          //
          // if the document file does not exist then create an empty one
          //
          val returnStat =  fsa.stat(documentNameAndPath).toFuture.foreach(stat =>
            val docStat = if stat != null then
              ( false, stat )
            else
              fsa.write(documentNameAndPath, "")
              ( true, null )

            try {
              val srcStat = fsMod.statSync(srcFile)

              val srcModTime = srcStat.get.mtimeMs

              if ( docStat._1 || docStat._2.mtime < srcModTime ) && isBranchStillActive then
                //
                // get comment lines from the srcFile then open doc file for writing and write the lines to it
                //
                val srcLines = fsMod.readFileSync(srcFile, l(encoding = "utf8", flag = "r")
                  .asInstanceOf[ObjectEncodingOptionsflagEncoding])
                  .asInstanceOf[String]

                val commentString = Lexer(srcLines)
                documentAndContentMap += ( s"$relativeDocumentPath${Utils.separator}$documentName".dropRight(3) -> commentString._1 )
                //
                // setup meta data in header of note
                //
                val metaData =
                  s"""---
                     |${commentString._2}---
                     |""".stripMargin

                fsa.write(documentNameAndPath, s"${metaData}[Source](file:$srcFile)\n\n---\n" + commentString._1).toFuture.foreach(Unit => ())
            } catch {
              case ex : js.JavaScriptException => println("source removed")
            }
          )
        )
        applicationFileListWithExtension = applicationFileListWithExtension.drop(1)
        phaseCount = 2

    if phaseCount == 4 && isBranchStillActive then
      //
      // every document that does not have a source file must be removed
      //
      documentFileListWithExtension.foreach((fileName: String) =>
        if !sourceAndDocumentLink.contains(fileName) then
          fsa.remove(fileName)
      )

      sourceAndDocumentLink.clear()
      documentAndContentMap.clear()
      phaseCount = -1

    phaseCount += 1

  /**
   * construct the document name given the source file name
   * @param sourceFile name used to construct the document name
   * @return the document name
   */
  private def createDocNameFromSourceName(sourceFile : String) =
    val docPath = s"${sourceFile.drop(applicationPath.length + 1).dropRight(codeExtension.length)}.md"
    val docName = docPath.replace(Utils.separator, ".")
    docName
