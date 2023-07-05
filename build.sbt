val scala3Version = "3.3.0"


lazy val root = project
    .enablePlugins(ScalaJSPlugin)
    .enablePlugins(ScalablyTypedConverterExternalNpmPlugin)
    .enablePlugins(ScalaJSBundlerPlugin)
    .in(file("."))
    .settings(
        name := "my-scala-js",
        version := "0.1.0-SNAPSHOT",
        webpackConfigFile  := Some(baseDirectory.value / "dev.webpack.config.cjs"),
        scalaVersion := scala3Version,
        scalaJSUseMainModuleInitializer := true,
        externalNpm := baseDirectory.value,
        scalaJSLinkerConfig ~= { _.withModuleKind(ModuleKind.CommonJSModule) },
        externalNpm := {
                    baseDirectory.value
        },

        Compile / npmDependencies  ++= Seq(
                "obsidian" -> "1.2.8",
                "electron" -> "25.1.1",
                "node" -> "20.3.1",
                "typescript" -> "5.1.3",
        ),
//        Compile / npmInstall := (Compile / npmInstall).dependsOn(ScalaJSBundlerPlugin).value,
//        Compile / webpack := (Compile / webpack).dependsOn(npmInstall in Compile).value,
//        Compile / build := (Compile / build).dependsOn(Compile / webpack).value,

        libraryDependencies += "org.scalameta" %% "munit" % "0.7.29" % Test,
        libraryDependencies += "org.scala-js" %%% "scalajs-dom" % "2.2.0",
  )
