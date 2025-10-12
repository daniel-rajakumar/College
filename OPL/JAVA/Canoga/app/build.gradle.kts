plugins {
    alias(libs.plugins.android.application)
}

android {
    namespace = "com.example.canoga"
    compileSdk {
        version = release(36)
    }

    defaultConfig {
        applicationId = "com.example.canoga"
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

    // ——— Android instrumented tests ———
    androidTestImplementation(libs.ext.junit)
    androidTestImplementation(libs.espresso.core)

    // ——— JUnit 5 (Jupiter) for local unit tests ———
    testImplementation("org.junit.jupiter:junit-jupiter-api:5.10.2")
    testImplementation("org.junit.jupiter:junit-jupiter-params:5.10.2")
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine:5.10.2")
    // Helps Android Studio run configs find the platform
    testRuntimeOnly("org.junit.platform:junit-platform-launcher:1.10.2")

    // If you still have JUnit4 tests, keep this; otherwise remove it:
    // testImplementation(libs.junit) // likely junit:4.13.2
}

// Important: use the JUnit Platform (needed for Jupiter)
tasks.withType<Test>().configureEach {
    useJUnitPlatform()
}
