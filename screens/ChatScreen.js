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

import { db } from "../services/db";

class ChatScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: <Text>{navigation.getParam('topic', {name: ''}).name}</Text>,
      headerRight: (
        <Button
          onPress={navigation.getParam('onPressNew') || (() => {})}
          title="New"
          color="#000"
        />
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

  _renderButton = (text, onPress) => (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.button}>
        <Text>{text}</Text>
      </View>
    </TouchableOpacity>
  );

  _renderModalContent = () => (
    <View style={styles.modalContent}>
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="comment..."
          multiline={true}
          numberOfLines={0}
          onChangeText={this.handleChangeText}
        />
        <Button
          title="submit"
          onPress={this.handleSubmitText}
          style={styles.submitButton}
        />
      </View>
      {this._renderButton('Close', () => this.setState({ visibleModal: false }))}
    </View>
  );

  _keyExtractor = (item, index) => item.id;

  _renderItem = ({item}) => (
    <View style={styles.listItemContainer}>
      <Text style={styles.listItem} numberOfLines={0}>{item.text}</Text>
    </View>
  );

  render() {
    return (
      <KeyboardAvoidingView
        behavior="padding"
        contentContainerStyle={styles.thread}
        style={styles.thread}
      >
        <FlatList
          style={styles.list}
          data={this.state.messages}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
        />
        <View>
        <Modal
          visible={this.state.visibleModal}
          animationType="slide"
          transparent={true}
        >
          {this._renderModalContent()}
        </Modal>
       </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  thread: {
    flex: 1
  },
  list: {
    flex: 1,
    backgroundColor: "#CCC"
  },
  listItem: {
    fontSize: 18
  },
  listItemContainer: {
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderBottomColor: "#333"
  },
  textInputContainer: {
    height: 100,
    flexDirection: "row",
    backgroundColor: "#FFF"
  },
  textInput: {
    flex: 1,
  },
  submitButton: {
    width: 60,
    backgroundColor: "#555"
  },
  button: {
    backgroundColor: 'lightblue',
    padding: 12,
    margin: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalContent: {
    marginTop: 100,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: '#555',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
});

export default ChatScreen;
