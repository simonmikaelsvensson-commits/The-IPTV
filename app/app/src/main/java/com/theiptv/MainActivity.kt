package com.theiptv

import android.app.Activity
import android.content.Intent
import android.content.Context
import android.os.Bundle
import android.widget.TextView
import android.os.AsyncTask
import android.util.Base64

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val tv = TextView(this)
        tv.text = "TheIPTV — loading users..."
        setContentView(tv)

        // show stored auth info if present
        val prefs = getSharedPreferences("theiptv_prefs", Context.MODE_PRIVATE)
        val token = prefs.getString("auth_token", null)
        if (token != null) {
            val info = decodeTokenInfo(token)
            tv.text = "Logged in as: ${info["username"] ?: info["sub"]}\nToken stored\nTap to view profile"
            tv.isClickable = true
            tv.setOnClickListener {
                startActivity(Intent(this, UserActivity::class.java))
            }
        }

        // handle intent (deep link) if present
        handleIntent(intent, tv)

        // Fetch users from backend (simple AsyncTask for skeleton)
        FetchUsersTask(tv).execute()
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        intent?.let { handleIntent(it, findViewById(android.R.id.content).rootView as? TextView ?: TextView(this)) }
    }

    private fun handleIntent(intent: Intent, tv: TextView) {
        val data = intent.data
        if (data != null) {
            val authToken = data.getQueryParameter("auth") ?: data.getQueryParameter("token")
            if (authToken != null) {
                // store token in SharedPreferences
                val prefs = getSharedPreferences("theiptv_prefs", Context.MODE_PRIVATE)
                prefs.edit().putString("auth_token", authToken).apply()
                val info = decodeTokenInfo(authToken)
                tv.text = "Logged in as: ${info.username ?: info.sub}\nToken saved"
                return
            }
        }
    }

    private fun decodeTokenInfo(token: String): Map<String, String?> {
        try {
            val parts = token.split('.')
            if (parts.size < 2) return mapOf("sub" to null, "username" to null)
            val payload = parts[1]
            val decoded = String(Base64.decode(payload.padEnd((payload.length + 3) / 4 * 4, '='), Base64.URL_SAFE))
            // crude parse: look for "sub" and "username"
            val sub = Regex("\"sub\"\s*:\s*([0-9]+)").find(decoded)?.groupValues?.get(1)
            val username = Regex("\"username\"\s*:\s*\"([^\"]+)\"").find(decoded)?.groupValues?.get(1)
            return mapOf("sub" to sub, "username" to username)
        } catch (e: Exception) {
            return mapOf("sub" to null, "username" to null)
        }
    }

    private class FetchUsersTask(val tv: TextView) : AsyncTask<Void,Void,String>(){
        override fun doInBackground(vararg params: Void?): String? {
            return try {
                ApiClient.getUsers()
            } catch (e: Exception){
                "error: ${e.message}"
            }
        }
        override fun onPostExecute(result: String?){
            // if not already showing login info, update with user list count or response
            if (!tv.text.contains("Logged in")) tv.text = result ?: "no response"
        }
    }
}
