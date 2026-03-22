import React from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import BottomSheet from '../ui/BottomSheet';
import { useAppTheme } from '../../theme/theme';

export default function DocumentViewerModal({ visible, onClose, resourceUrl }) {
  const theme = useAppTheme();
  
  if (!resourceUrl) return null;

  const secureUrl = resourceUrl.replace('http://', 'https://');
  const isImage = secureUrl.match(/\.(jpeg|jpg|png|gif)$/i) || secureUrl.includes('image');
  const isOfficeDoc = secureUrl.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/i);
  
  let viewerUrl = secureUrl;
  if (!isImage) {
    if (isOfficeDoc) {
      viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(secureUrl)}`;
    } else {
      viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(secureUrl)}`;
    }
  }

  return (
    <BottomSheet isVisible={visible} onClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {isImage ? (
          <Image 
            source={{ uri: viewerUrl }} 
            style={styles.imageViewer} 
            resizeMode="contain" 
          />
        ) : (
          <WebView
            source={{ uri: viewerUrl }}
            style={styles.webview}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mixedContentMode="always"
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            originWhitelist={['*']}
            renderLoading={() => (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.log('Erreur silencieuse WebView: ', nativeEvent);
            }}
          />
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { 
    height: 500, 
    width: '100%', 
    overflow: 'hidden', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20 
  },
  webview: { 
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  imageViewer: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  loader: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  }
});