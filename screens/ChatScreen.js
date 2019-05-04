import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  Modal
} from 'react-native';
import { createStackNavigator, createAppContainer } from "react-navigation";
import SafeAreaView from 'react-native-safe-area-view';

import { db } from "../services/db";

class ChatScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: <Text style={styles.title}>{navigation.getParam('topic', {name: ''}).name}</Text>,
      headerRight: (
        <TouchableOpacity
          onPress={navigation.getParam('onPressNew') || (() => {})}
          style={styles.barButton}
        >
          <Text style={styles.barButtonText}>Post</Text>
        </TouchableOpacity>
      ),
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      text: '',
      messages: [],
      visibleModal: false,
    };

    this.handleChangeText = this.handleChangeText.bind(this);
    this.handleSubmitText = this.handleSubmitText.bind(this);

    // メッセージが追加されたときのイベントリスナーを用意
    this.messagePath = `topics/${this.props.navigation.getParam('topic', {id: ''}).id}/messages`;
    db.collection(this.messagePath)
      .orderBy("created_at")
      .onSnapshot(snapshot => {
        this.setState({
          text: '',
          messages: snapshot.docs.map(doc => ({ id: doc.id, text: doc.data().text, createdAt: doc.data().created_at }))
        });
      });
  }

  componentDidMount() {
    this.props.navigation.setParams({ onPressNew: this._onPressNew });
  }

  handleChangeText(text) {
    this.setState({
      text
    });
  }

  handleSubmitText() {
    db.collection(this.messagePath).add({
      text: this.state.text,
      created_at: new Date()
    });

    this.setState({ visibleModal: false });
  }

  _onPressNew = () => {
    this.setState({ visibleModal: true });
  };

  _renderModalContent = () => (
    <View style={styles.modalContent}>
      <TextInput
        style={styles.textInput}
        placeholder="Message"
        multiline={true}
        numberOfLines={0}
        onChangeText={this.handleChangeText}
      />
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => this.setState({ visibleModal: false })}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText} >Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={this.handleSubmitText}
          style={styles.submitButton}
        >
          <Text style={styles.submitButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  _keyExtractor = (item, index) => item.id;

  _renderItem = ({item}) => (
    <View style={styles.listItem}>
      <Text style={styles.listItemText} numberOfLines={0}>{item.text}</Text>
    </View>
  );

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          style={styles.list}
          data={this.state.messages}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
        />
        <Modal
          visible={this.state.visibleModal}
          animationType="slide"
          transparent={true}
        >
          {this._renderModalContent()}
        </Modal>
     </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 16
  },
  barButton: {
    paddingRight: 10
  },
  barButtonText: {
    fontSize: 16,
    color: 'blue'
  },
  listItem: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    padding: 10,
    borderColor: 'gray',
    borderBottomWidth: 1
  },
  listItemText: {
    fontSize: 16
  },
  textInput: {
    marginBottom: 20,
    height: 160,
    backgroundColor: "#fff",
    padding: 4
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  submitButton: {
    width: 80,
    backgroundColor: 'blue',
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'blue',
    borderWidth: 1
  },
  submitButtonText: {
    color: '#fff'
  },
  cancelButton: {
    width: 80,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'blue'
  },
  modalContent: {
    marginTop: 100,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: 'silver',
    padding: 22,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default ChatScreen;
