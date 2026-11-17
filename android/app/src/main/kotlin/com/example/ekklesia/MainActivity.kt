package com.example.ekklesia

import android.annotation.SuppressLint
import android.content.Context
import android.content.SharedPreferences
import android.graphics.Bitmap
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ekklesia.ui.theme.EKKLESIATheme

class MainActivity : ComponentActivity() {

  companion object {
    const val PREFS_NAME = "ekklesia_prefs"
    const val KEY_SERVER_URL = "server_url"
    const val DEFAULT_SERVER_URL = "http://192.168.0.15:3000"
  }

  private var webView: WebView? = null
  private lateinit var prefs: SharedPreferences

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // 1. Pantalla siempre encendida en el escenario (Wake Lock nativo)
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

    prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    // Manejo nativo de gestos de regreso (predictive back gesture de Android)
    onBackPressedDispatcher.addCallback(this, object : androidx.activity.OnBackPressedCallback(true) {
      override fun handleOnBackPressed() {
        if (webView?.canGoBack() == true) {
          webView?.goBack()
        } else {
          isEnabled = false
          onBackPressedDispatcher.onBackPressed()
        }
      }
    })

    enableEdgeToEdge()
    setContent {
      EKKLESIATheme {
        Surface(
          modifier = Modifier.fillMaxSize(),
          color = Color(0xFF0F172A)
        ) {
          EkklesiaScreen(
            initialUrl = prefs.getString(KEY_SERVER_URL, DEFAULT_SERVER_URL) ?: DEFAULT_SERVER_URL,
            onSaveUrl = { newUrl ->
              prefs.edit().putString(KEY_SERVER_URL, newUrl).apply()
            },
            onAttachWebView = { wv ->
              webView = wv
            }
          )
        }
      }
    }
  }

  // 2. Interceptación de botones físicos de volumen y pedales Bluetooth para pasar acordes
  override fun dispatchKeyEvent(event: KeyEvent): Boolean {
    if (event.action == KeyEvent.ACTION_DOWN) {
      when (event.keyCode) {
        KeyEvent.KEYCODE_VOLUME_DOWN, KeyEvent.KEYCODE_PAGE_DOWN -> {
          // Scroll hacia abajo o siguiente sección
          webView?.evaluateJavascript(
            "window.scrollBy({ top: 320, behavior: 'smooth' });",
            null
          )
          return true // Consumir para no mostrar la barra de volumen
        }
        KeyEvent.KEYCODE_VOLUME_UP, KeyEvent.KEYCODE_PAGE_UP -> {
          // Scroll hacia arriba
          webView?.evaluateJavascript(
            "window.scrollBy({ top: -320, behavior: 'smooth' });",
            null
          )
          return true // Consumir para no mostrar la barra de volumen
        }
      }
    }
    return super.dispatchKeyEvent(event)
  }

  override fun onBackPressed() {
    if (webView?.canGoBack() == true) {
      webView?.goBack()
    } else {
      super.onBackPressed()
    }
  }
}

@SuppressLint("SetJavaScriptEnabled")
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EkklesiaScreen(
  initialUrl: String,
  onSaveUrl: (String) -> Unit,
  onAttachWebView: (WebView) -> Unit
) {
  var serverUrl by remember { mutableStateOf(initialUrl) }
  var isConfigDialogOpen by remember { mutableStateOf(false) }
  var hasLoadError by remember { mutableStateOf(false) }
  var errorMessage by remember { mutableStateOf("") }
  var isLoading by remember { mutableStateOf(true) }
  var internalWebView by remember { mutableStateOf<WebView?>(null) }

  Box(modifier = Modifier.fillMaxSize()) {
    // Componente WebView optimizado para audio y alto rendimiento con padding de barra de estado
    AndroidView(
      modifier = Modifier
        .fillMaxSize()
        .statusBarsPadding()
        .navigationBarsPadding(),
      factory = { ctx ->
        WebView(ctx).apply {
          layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
          )

          settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false // Permite reproducir Pads y Metrónomo sin toque inicial
            loadWithOverviewMode = true
            useWideViewPort = true
            builtInZoomControls = false
            displayZoomControls = false
            setSupportZoom(true)
            cacheMode = WebSettings.LOAD_DEFAULT
            allowFileAccess = true
          }

          webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
              if (newProgress >= 100) {
                isLoading = false
              }
            }
          }

          webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
              super.onPageStarted(view, url, favicon)
              isLoading = true
              hasLoadError = false
            }

            override fun onPageFinished(view: WebView?, url: String?) {
              super.onPageFinished(view, url)
              isLoading = false
            }

            override fun onReceivedError(
              view: WebView?,
              request: WebResourceRequest?,
              error: WebResourceError?
            ) {
              super.onReceivedError(view, request, error)
              if (request?.isForMainFrame == true) {
                hasLoadError = true
                errorMessage = error?.description?.toString() ?: "Error de conexión"
              }
            }
          }

          loadUrl(serverUrl)
          internalWebView = this
          onAttachWebView(this)
        }
      },
      update = { wv ->
        // Actualizar si la URL cambia
      }
    )

    // Botón flotante sutil en esquina inferior para configurar servidor sin estorbar la barra superior
    IconButton(
      onClick = { isConfigDialogOpen = true },
      modifier = Modifier
        .navigationBarsPadding()
        .padding(start = 6.dp, bottom = 6.dp)
        .size(24.dp)
        .align(Alignment.BottomStart)
        .background(Color(0x44000000), RoundedCornerShape(12.dp))
    ) {
      Text("⚙", fontSize = 11.sp, color = Color(0x88FFFFFF))
    }

    // Pantalla de error amigable si el servidor no responde
    if (hasLoadError) {
      Box(
        modifier = Modifier
          .fillMaxSize()
          .background(Color(0xFF090D16))
          .padding(24.dp),
        contentAlignment = Alignment.Center
      ) {
        Card(
          shape = RoundedCornerShape(20.dp),
          colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
          ) {
            Text(
              text = "🏛️ EKKLESIA MUSIC",
              color = Color(0xFFF59E0B),
              fontSize = 20.sp,
              fontWeight = FontWeight.Black
            )

            Text(
              text = "No se pudo conectar con el servidor local:",
              color = Color.White,
              fontSize = 14.sp,
              textAlign = TextAlign.Center
            )

            Text(
              text = serverUrl,
              color = Color(0xFF38BDF8),
              fontSize = 13.sp,
              fontFamily = FontFamily.Monospace,
              textAlign = TextAlign.Center,
              modifier = Modifier
                .background(Color(0xFF0F172A), RoundedCornerShape(8.dp))
                .padding(horizontal = 12.dp, vertical = 6.dp)
            )

            Text(
              text = "1. Verifica que tu celular esté conectado a la misma red Wi-Fi de la iglesia.\n2. Asegúrate de que la app servidora esté abierta en la laptop.",
              color = Color(0xFF94A3B8),
              fontSize = 12.sp,
              lineHeight = 18.sp,
              textAlign = TextAlign.Start
            )

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
              OutlinedButton(
                onClick = { isConfigDialogOpen = true },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp)
              ) {
                Text("Cambiar IP", fontSize = 12.sp)
              }

              Button(
                onClick = {
                  hasLoadError = false
                  internalWebView?.loadUrl(serverUrl)
                },
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B)),
                shape = RoundedCornerShape(12.dp)
              ) {
                Text("Reintentar", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
              }
            }
          }
        }
      }
    }

    // Diálogo para Cambiar la IP del Servidor Central
    if (isConfigDialogOpen) {
      var tempUrl by remember { mutableStateOf(serverUrl) }

      AlertDialog(
        onDismissRequest = { isConfigDialogOpen = false },
        title = {
          Text("Configuración de Servidor EKKLESIA", fontWeight = FontWeight.Bold, fontSize = 16.sp)
        },
        text = {
          Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(
              "Ingresa la dirección IP que muestra la app en la laptop servidora (ej: http://192.168.0.15:3000):",
              fontSize = 12.sp,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            OutlinedTextField(
              value = tempUrl,
              onValueChange = { tempUrl = it },
              singleLine = true,
              label = { Text("URL del Servidor") },
              modifier = Modifier.fillMaxWidth()
            )

            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
              FilledTonalButton(
                onClick = { tempUrl = MainActivity.DEFAULT_SERVER_URL },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(8.dp)
              ) {
                Text("IP Actual (192.168.0.15)", fontSize = 10.sp)
              }
            }
          }
        },
        confirmButton = {
          Button(
            onClick = {
              val formatted = if (!tempUrl.startsWith("http://") && !tempUrl.startsWith("https://")) {
                "http://$tempUrl"
              } else {
                tempUrl
              }
              serverUrl = formatted
              onSaveUrl(formatted)
              isConfigDialogOpen = false
              hasLoadError = false
              internalWebView?.loadUrl(formatted)
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B))
          ) {
            Text("Guardar y Conectar", color = Color.Black, fontWeight = FontWeight.Bold)
          }
        },
        dismissButton = {
          TextButton(onClick = { isConfigDialogOpen = false }) {
            Text("Cancelar")
          }
        }
      )
    }
  }
}
