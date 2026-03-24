import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import BottomSheet from '../ui/BottomSheet';
import AnimatedButton from '../ui/AnimatedButton';
import { useAppTheme } from '../../theme/theme';

export default function DocumentViewerModal({ visible, onClose, resource, token }) {
  const theme = useAppTheme();
  const webViewRef = useRef(null);
  const [retryKey, setRetryKey] = useState(Date.now());
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasViewerError, setHasViewerError] = useState(false);
  
  const MAX_RETRIES = 3;

  useEffect(() => {
    if (visible) {
      resetState();
    }
  }, [visible, resource]);

  const resetState = () => {
    setRetryKey(Date.now());
    setRetryCount(0);
    setIsLoading(true);
    setHasViewerError(false);
  };

  if (!resource || !resource.resolvedUrl) return null;

  const resourceUrl = resource.resolvedUrl;
  const format = resource.format?.toLowerCase() || '';

  const isLocalAddress = resourceUrl.match(/192\.168|localhost|10\.0\.2\.2/);
  const finalUrl = isLocalAddress ? resourceUrl : resourceUrl.replace('http://', 'https://');
  const isImage = ['png', 'jpg', 'jpeg', 'gif'].includes(format);
  
  const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL || '';
  const isOurBackend = finalUrl.includes('192.168') || finalUrl.includes('localhost') || (rawBaseUrl && finalUrl.includes(rawBaseUrl.replace('http://', '')));
  const isCloudinary = finalUrl.includes('cloudinary.com');
  const isPrivate = isOurBackend && !isCloudinary;

  let viewerUrl = finalUrl;
  let requiresDownload = false;
  let headers = {};

  const targetUrl = finalUrl + (finalUrl.includes('?') ? '&cb=' : '?cb=') + retryKey;
  const encodedUrl = encodeURIComponent(targetUrl);

  if (!isImage) {
    if (isPrivate && Platform.OS === 'android') {
      requiresDownload = true;
    } else if (Platform.OS === 'android') {
      const isOfficeDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(format);
      viewerUrl = isOfficeDoc 
        ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`
        : `https://docs.google.com/viewer?embedded=true&url=${encodedUrl}`;
    } else {
      viewerUrl = targetUrl;
      if (isPrivate && token) headers = { Authorization: `Bearer ${token}` };
    }
  } else if (isPrivate && token) {
    headers = { Authorization: `Bearer ${token}` };
  }

  const handleAutoRetry = () => {
    if (retryCount < MAX_RETRIES) {
      setIsLoading(true);
      setRetryCount(prev => prev + 1);
      setRetryKey(Date.now());
    } else {
      setHasViewerError(true);
      setIsLoading(false);
    }
  };

  const handleManualRetry = () => {
    resetState();
  };

  const injectedJavaScript = `
    (function() {
      var checkError = function() {
        var text = document.body.innerText || "";
        var errorPatterns = ["No preview available", "Apercu indisponible", "Too many requests", "Refused to connect"];
        var found = errorPatterns.some(function(p) { return text.indexOf(p) !== -1; });
        var isEmpty = document.body.children.length === 0 && text.trim().length === 0;
        if (found || isEmpty) { window.ReactNativeWebView.postMessage('VIEWER_ERROR'); }
      };
      setTimeout(checkError, 4000);
    })();
    true;
  `;

  const onMessage = (event) => {
    if (event.nativeEvent.data === 'VIEWER_ERROR') handleAutoRetry();
  };

  const webViewSource = { uri: viewerUrl };
  if (Object.keys(headers).length > 0) webViewSource.headers = headers;

  return (
    <BottomSheet isVisible={visible} onClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {isImage ? (
          <Image 
            source={{ uri: viewerUrl, headers: Object.keys(headers).length > 0 ? headers : undefined }} 
            style={styles.imageViewer} 
            resizeMode="contain"
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
          />
        ) : (requiresDownload || hasViewerError) ? (
          <View style={[styles.fallbackContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.fallbackText, { color: theme.colors.text }]}>
              {hasViewerError 
                ? "L'affichage a echoue apres plusieurs tentatives." 
                : "Ce document prive doit etre telecharge pour etre lu sur Android."}
            </Text>
            <Text style={[styles.fallbackSubtext, { color: theme.colors.textMuted }]}>
              {hasViewerError 
                ? "Vous pouvez essayer de relancer l'apercu ou utiliser le telechargement."
                : "Utilisez le bouton de telechargement sur la carte de la ressource."}
            </Text>
            
            {hasViewerError && (
              <AnimatedButton 
                title="Ressayer" 
                onPress={handleManualRetry}
                style={styles.retryButton}
              />
            )}
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            key={retryKey}
            source={webViewSource}
            style={[styles.webview, { backgroundColor: theme.colors.surface }]}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mixedContentMode="always"
            originWhitelist={['*']}
            injectedJavaScript={injectedJavaScript}
            onMessage={onMessage}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => { setTimeout(() => setIsLoading(false), 1500); }}
            onError={handleAutoRetry}
          />
        )}
        
        {isLoading && !requiresDownload && !hasViewerError && (
          <View style={[styles.loader, { backgroundColor: theme.colors.surface }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.primary }]}>
              Chargement du document...
            </Text>
            {retryCount > 0 && (
              <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 8 }}>
                Tentative {retryCount}/{MAX_RETRIES}
              </Text>
            )}
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { height: 550, width: '100%', overflow: 'hidden', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  webview: { flex: 1 },
  imageViewer: { flex: 1, width: '100%', height: '100%' },
  loader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  loadingText: { marginTop: 12, fontSize: 14, fontWeight: '700' },
  fallbackContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  fallbackText: { fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  fallbackSubtext: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  retryButton: { width: '80%', height: 50 }
});