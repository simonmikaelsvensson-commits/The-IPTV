package com.theiptv

import android.app.Activity
import android.content.Context
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Button
import android.view.ViewGroup
import android.util.Base64

class UserActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val prefs = getSharedPreferences("theiptv_prefs", Context.MODE_PRIVATE)
        val token = prefs.getString("auth_token", null)

        val layout = LinearLayout(this)
        layout.orientation = LinearLayout.VERTICAL
        layout.setPadding(32,32,32,32)

        val title = TextView(this)
        title.textSize = 20f
        title.text = "User"
        layout.addView(title)

        val tv = TextView(this)
        if (token != null) {
            val info = decodeTokenInfo(token)
            tv.text = "Logged in as: ${info["username"] ?: info["sub"]}\n\nToken: ${token.take(80)}..."
        } else {
            tv.text = "Not logged in"
        }
        layout.addView(tv)

        val btn = Button(this)
        btn.text = "Logout"
        btn.setOnClickListener {
            prefs.edit().remove("auth_token").apply()
            finish()
        }
        layout.addView(btn)

        setContentView(layout, ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
    }

    private fun decodeTokenInfo(token: String): Map<String, String?> {
        try {
            val parts = token.split('.')
            if (parts.size < 2) return mapOf("sub" to null, "username" to null)
            val payload = parts[1]
            val padded = payload.padEnd((payload.length + 3) / 4 * 4, '=')
            val decoded = String(Base64.decode(padded, Base64.URL_SAFE))
            val sub = Regex("\"sub\"\s*:\s*([0-9]+)").find(decoded)?.groupValues?.get(1)
            val username = Regex("\"username\"\s*:\s*\"([^\"]+)\"").find(decoded)?.groupValues?.get(1)
            return mapOf("sub" to sub, "username" to username)
        } catch (e: Exception) {
            return mapOf("sub" to null, "username" to null)
        }
    }
}
