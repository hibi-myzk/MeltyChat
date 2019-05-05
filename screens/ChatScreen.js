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
  Modal,
  YellowBox,
  Platform
} from 'react-native';
import { createStackNavigator, createAppContainer } from "react-navigation";
import SafeAreaView from 'react-native-safe-area-view';
import moment from 'moment';

import { db } from "../services/db";

YellowBox.ignoreWarnings(['Setting a timer']);

const isAndroid = Platform.OS == "android";

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
      topic: this.props.navigation.getParam('topic', {id: '', name: ''}),
      text: '',
      messages: [],
      visibleModal: false,
      username: this.props.navigation.getParam('username', '')
    };

    this.handleChangeText = this.handleChangeText.bind(this);
    this.handleSubmitText = this.handleSubmitText.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setParams({ onPressNew: this._onPressNew });

    // メッセージが追加されたときのイベントリスナーを用意
    this.messagePath = `topics/${this.props.navigation.getParam('topic', {id: ''}).id}/messages`;
    this.unsubscribe = db.collection(this.messagePath)
      .orderBy("created_at", "desc")
      .onSnapshot(snapshot => {
        this.setState({
          text: '',
          messages: snapshot.docs.map(doc => ({
            id: doc.id,
            text: doc.data().text,
            username: doc.data().username,
            createdAt: new Date(doc.data().created_at.toDate())
          }))
        });
      });
  }

  componentWillUnmount() {
    // onCollectionUpdateの登録解除
    this.unsubscribe();
  }

  handleChangeText(text) {
    this.setState({
      text
    });
  }

  handleSubmitText() {
    let now = new Date();

    db.collection(this.messagePath).add({
      text: this.state.text.slice(0, 400),
      username: this.state.username,
      created_at: now
    });

    db.collection('topics').doc(this.state.topic.id).set({
      name: this.state.topic.name,
      updated_at: now
    });

    this.setState({ visibleModal: false });
  }

  _onPressNew = () => {
    this.setState({ visibleModal: true });
  };

  _checkCount = () => {
    return ((0 < this.state.text.length) && (this.state.text.length <= 400));
  }

  _renderModalContent = () => (
    <View style={styles.modalBack}>
      <View style={styles.modalContent}>
        <TextInput
          style={styles.textInput}
          placeholder="Message"
          multiline={true}
          numberOfLines={0}
          onChangeText={this.handleChangeText}
        />
        <View>
          <Text style={[styles.counterText, {color: this._checkCount() ? 'black' : 'red'}]}>{this.state.text.length}/400</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => this.setState({ visibleModal: false })}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText} >Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.handleSubmitText}
            style={[styles.submitButton, {opacity: this._checkCount() ? 1.0 : 0.2}]}
            disabled={!this._checkCount()}
          >
            <Text style={styles.submitButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  _keyExtractor = (item, index) => item.id;

  _renderItem = ({item}) => (
    <View style={styles.listItem}>
      <View style={styles.metadata}>
        <Text key="username" style={styles.username}>{item.username}</Text>
        <Text key="timestamp" style={styles.timestamp}>{moment(item.createdAt).fromNow()}</Text>
      </View>
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
          ref={ref => this.flatList = ref}
        />
        <Modal
          visible={this.state.visibleModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {}}
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
    padding: 10,
    borderColor: 'gray',
    borderBottomWidth: 1
  },
  listItemText: {
    fontSize: 16,
    lineHeight: 20
  },
  metadata: {
    marginBottom: isAndroid ? 12 : 4,
    flexDirection: 'row'
  },
  username: {
    fontSize: 14,
    color: 'gray'
  },
  timestamp: {
    position: 'absolute',
    right: 0,
    fontSize: 14,
    color: 'gray'
  },
  textInput: {
    marginBottom: 8,
    height: 160,
    backgroundColor: "#fff",
    padding: 4,
    borderColor: "gray",
    borderWidth: 1
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
    fontSize: 16,
    color: '#fff'
  },
  cancelButton: {
    width: 80,
    padding: 12,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: 'blue'
  },
  modalBack: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    marginTop: 100,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  counterText: {
    textAlign: 'right'
  }
});

export default ChatScreen;
