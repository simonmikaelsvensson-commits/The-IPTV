package com.theiptv.network

import java.net.HttpURLConnection
import java.net.URL

object ApiClient {
    private val base = "http://10.0.2.2:3000" // emulator -> host. Change to server host when deployed.

    fun getUsers(): String {
        val url = URL("$base/users")
        val conn = url.openConnection() as HttpURLConnection
        conn.requestMethod = "GET"
        conn.connectTimeout = 5000
        conn.readTimeout = 5000
        return try {
            val code = conn.responseCode
            if (code != 200) return "HTTP $code"
            conn.inputStream.bufferedReader().use { it.readText() }
        } finally {
            conn.disconnect()
        }
    }
}
