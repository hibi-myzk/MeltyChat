import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  KeyboardAvoidingView,
  TextInput,
} from 'react-native';
import { createStackNavigator, createAppContainer } from "react-navigation";

import { db } from "../services/db";

class ChatScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: <Text>{navigation.getParam('topic', {name: ''}).name}</Text>,
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      text: '',
      messages: []
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
    console.log(this.props.navigation.getParam('item', {id: ''}));
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
  }

  _keyExtractor = (item, index) => item.id;

  _renderItem = ({item}) => (
    <View style={styles.listItemContainer}>
      <Text style={styles.listItem}>{item.text}</Text>
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
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="comment..."
            onChangeText={this.handleChangeText}
          />
          <Button
            title="submit"
            onPress={this.handleSubmitText}
            style={styles.submitButton}
          />
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
    borderBottomColor: "#333",
    height: 50
  },
  textInputContainer: {
    height: 50,
    flexDirection: "row",
    backgroundColor: "#FFF"
  },
  textInput: {
    flex: 1
  },
  submitButton: {
    width: 60,
    backgroundColor: "#555"
  }
});

export default ChatScreen;
