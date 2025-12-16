import com.android.build.gradle.AppExtension
import com.android.build.gradle.BaseExtension

plugins {
    alias(libs.plugins.android.application)
}

android {


    namespace = "com.example.oplcanoga"
    compileSdk {
        version = release(36)
    }

    defaultConfig {
        applicationId = "com.example.oplcanoga"
        minSdk = 36
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}

dependencies {
    implementation(libs.appcompat)
    implementation(libs.material)
    implementation(libs.activity)
    implementation(libs.constraintlayout)
    implementation(libs.games.activity)
    testImplementation(libs.junit)
    androidTestImplementation(libs.ext.junit)
    androidTestImplementation(libs.espresso.core)
}


// ... existing dependencies block ...

// Add this at the end of your app/build.gradle.kts file.
// We use 'android.applicationVariants.all' to safely access the 'release' variant configuration.

// ... dependencies block ...

tasks.register<Javadoc>("generateJavadoc") {
    description = "Generates Javadoc for the main source code."
    group = "documentation"

    // 1. Initial Source: Tell Gradle to look at src/main/java so it doesn't skip the task
    source = fileTree("src/main/java")

    // 2. Output directory
    setDestinationDir(file("${project.layout.buildDirectory.get()}/outputs/javadoc"))

    // 3. Javadoc Options
    val options = options as StandardJavadocDocletOptions
    options.memberLevel = JavadocMemberLevel.PRIVATE
    options.links("https://docs.oracle.com/javase/8/docs/api/")
    options.links("https://d.android.com/reference/")
    options.addBooleanOption("Xdoclint:none", true)

    // 4. Execution Logic (runs when the task starts)
    doFirst {
        val androidExtension = project.extensions.getByType(AppExtension::class.java)
        val variant = androidExtension.applicationVariants.find { it.name == "release" }

        if (variant != null) {
            // A. CLASSPATH: Boot classpath + Release libraries
            classpath = files(androidExtension.bootClasspath) + variant.javaCompileProvider.get().classpath

            // B. SOURCE: Combine manual source + generated R.java
            val sourceSet = variant.sourceSets.find { it.name == "main" }

            // FIX APPLIED HERE: Wrap javaDirectories in files()
            val javaSources = if (sourceSet != null) files(sourceSet.javaDirectories) else fileTree("src/main/java")

            // Paths to generated files (R.java, etc.)
            val generatedSources = fileTree("${project.layout.buildDirectory.get()}/generated/ap_generated_sources/release/out")
            val rClassSources = fileTree("${project.layout.buildDirectory.get()}/generated/not_namespaced_r_class_sources/release/r")

            // Now all three variables are FileCollections and can be added together
            source(javaSources + generatedSources + rClassSources)

            println("JAVADOC: Generating docs for ${source.files.size} files.")
        } else {
            println("JAVADOC WARNING: Could not find 'release' variant.")
        }
    }
}

