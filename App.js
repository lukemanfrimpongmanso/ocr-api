import React, { useState } from 'react';
import { Button, View, Text } from 'react-native';
import ImagePicker from 'react-native-image-picker';

const App = () => {
  const [ocrResult, setOcrResult] = useState(null);
  const [extractedTexts, setExtractedTexts] = useState([]);

  const selectImage = () => {
    const options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    // change to specific camera lybrary
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        sendToAzure(response.data);
      }
    });
  };

  // accessing API 
  const sendToAzure = (base64Image) => {
    const endpoint = 'YOUR_ENDPOINT_URL/vision/v3.1/ocr';
    const apiKey = 'YOUR_SUBSCRIPTION_KEY';

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': apiKey,
      },
      body: base64Image,
    })
    .then(response => response.json())
    .then(data => {
      setOcrResult(data);
      const contents = extractContentFromResponse(data);
      setExtractedTexts(contents);
      console.log(contents);
    })
    .catch(error => {
      console.error("There was an error uploading the image", error);
    });
  };

  // Extracting specific content from API response(JSON)
  const extractContentFromResponse = (response) => {
    if (!response || !Array.isArray(response) || response.length === 0) {
      return [];
    }
  
    const wordsArray = response[0].words;
    if (!wordsArray || !Array.isArray(wordsArray)) {
      return [];
    }
  
    return wordsArray.map(word => word.content);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Select Image" onPress={selectImage} />
      {extractedTexts.length > 0 && <Text>{extractedTexts.join(', ')}</Text>}
    </View>
  );
};

export default App;
