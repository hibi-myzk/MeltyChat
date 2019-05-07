import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  AsyncStorage,
  Platform
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';

import { eula } from "../eula";

const isAndroid = Platform.OS == "android";

class EULAModal extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      visibleModal: false
    };
  }

  componentDidMount() {
    AsyncStorage.getItem('EULA_AGREED', (err, data) => {
      if (data === 'true'){
        this.setState({visibleModal: false})
      } else {
        this.setState({visibleModal: true})
      }
    });
  }

  _onPressAccept = () => {
    AsyncStorage.setItem('EULA_AGREED', 'true');

    this.setState({visibleModal: false});

    this.props.onPressAccept();
  };

  render() {
    return (
      <Modal
        visible={this.state.visibleModal}
        animationType="none"
        transparent={true}
        onRequestClose={() => {}}
      >
        <SafeAreaView style={styles.modalBack}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.message}>
              <Text style={styles.messageText}>{eula}</Text>
            </ScrollView>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={this._onPressAccept}
                style={styles.acceptButton}
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalBack: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    margin: 20,
    marginBottom: isAndroid ? 100 : 60,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  message: {
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10
  },
  messageText: {
    fontSize: 14
  },
  actions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  acceptButton: {
    width: 80,
    backgroundColor: 'blue',
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'blue',
    borderWidth: 1
  },
  acceptButtonText: {
    fontSize: 16,
    color: '#fff'
  }
});

export default EULAModal;
