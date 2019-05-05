import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  TouchableOpacity,
  AlertIOS,
  Platform,
  AsyncStorage,
  Modal,
  TextInput,
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import moment from 'moment'

import { db } from "../services/db";

class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: <Text style={styles.title}>Melty Chat</Text>,
      headerRight: (
        <TouchableOpacity
          onPress={navigation.getParam('onPressNew') || (() => {})}
          style={styles.barButton}
        >
          <Text style={styles.barButtonText}>New</Text>
        </TouchableOpacity>
      ),
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      topics: [],
      username: null,
      visibleUsernamePrompt: false,
      usernamePromptMessage: '',
      visibleNewTopicPrompt: false
    };

    db.collection("topics")
      .orderBy("updated_at", "desc")
      .onSnapshot(snapshot => {
        this.setState({
          topics: snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            updatedAt: new Date(doc.data().updated_at.toDate())
          }))
        });
      });
  }

  componentDidMount() {
    this.props.navigation.setParams({ onPressNew: this._onPressNew });

    AsyncStorage.getItem('USERNAME', (err, data) => {
      if (data !== null){
        this.setState({username: data})
      } else {
        this._changeUsername();
      }
    });
  }

  _saveUsername = (name) => {
    name = name.trim();

    if (name.length == 0) {
      this._changeUsername();
      return;
    } else if (10 < name.length) {
      this._changeUsername();
      return;
    } else if (/^[a-zA-Z0-9_]+$/.test(name) == false) {
      this._changeUsername();
      return;
    }

    let lowerName = name.toLowerCase();

    db.collection("usernames").doc(lowerName)
      .get()
      .then((doc) => {
        if (doc.exists) {
          this._changeUsername(name + ' is token.');
        } else {
          db.collection("usernames").doc(lowerName).set({created_at: new Date()});
          AsyncStorage.setItem('USERNAME', name);
        }
      })
      .catch((err) => {
          console.log(err);
      });
  };

  _changeUsername = (message) => {
    if (message === undefined) {
      message = 'Username can include alphabet, number and underscore.\n(Max length is 10 characters.)';
    }

    this.setState({
      usernamePromptMessage: message,
      visibleUsernamePrompt: true
    });

    // if (Platform.OS == 'ios') {
    //   AlertIOS.prompt(
    //     'Username',
    //     message,
    //     [
    //       {text: 'OK', onPress: name => this._saveUsername(name) },
    //     ],
    //   );
    // } else if (Platform.OS == 'android') {
    // }
  };

  _onPressNew = () => {
    this.setState({ visibleNewTopicPrompt: true });
    // if (Platform.OS == 'ios') {
    //   AlertIOS.prompt(
    //     'New topic',
    //     'Input new topic name.',
    //     [
    //       {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
    //       {text: 'OK', onPress: name => this._newTopic(name) },
    //     ],
    //   );
    // } else if (Platform.OS == 'android') {
    // }
  };

  _newTopic = (name) => {
    db.collection("topics").add({
      name: name,
      updated_at: new Date()
    });

    this.setState({ visibleNewTopicPrompt: false });
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <MyList
          navigation={this.props.navigation}
          data={this.state.topics}
          username={this.state.username}
        />
        <Prompt
          visible={this.state.visibleUsernamePrompt}
          title="Username"
          message={this.state.usernamePromptMessage}
          placeholder="Username"
          onPressOK={ name => this._saveUsername(name) }
        />
        <Prompt
          visible={this.state.visibleNewTopicPrompt}
          title="New topic"
          message="Input new topic name."
          placeholder="Topic name"
          onPressOK={ name => this._newTopic(name) }
        />
      </SafeAreaView>
    );
  }
}

class MyListItem extends React.PureComponent {
  _onPress = () => {
    this.props.onPressItem(this.props);
  };

  render() {
    return (
      <TouchableOpacity onPress={this._onPress}>
        <View style={styles.listItem}>
          <Text style={styles.listItemText}>{this.props.name}</Text>
          <Text style={styles.timestamp}>{moment(this.props.updatedAt).fromNow()}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

class MyList extends React.PureComponent {
  _keyExtractor = (item, index) => item.id;

  _onPressItem = (item) => {
    this.props.navigation.navigate('Chat', {username: this.props.username, topic: item});
  };

  _renderItem = ({item}) => (
    <MyListItem
      id={item.id}
      onPressItem={this._onPressItem}
      name={item.name}
      updatedAt={item.updatedAt}
    />
  );

  render() {
    return (
      <FlatList
        data={this.props.data}
        keyExtractor={this._keyExtractor}
        renderItem={this._renderItem}
      />
    );
  }
}

class Prompt extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      text: '',
      visibleModal: this.props.visible
    };

    this.handleChangeText = this.handleChangeText.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      visibleModal: nextProps.visible
    });
  }

  handleChangeText(text) {
    this.setState({
      text
    });
  }

  _onPressCancel = () => {
    this.setState({ visibleModal: false });
  };

  _onPressOK = () => {
    this.props.onPressOK(this.state.text);
    this.setState({ visibleModal: false });
  };

  _checkCount = () => {
    return (0 < this.state.text.length);
  }

  render() {
    return (
      <Modal
        visible={this.state.visibleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {}}
      >
        <View style={styles.modalBack}>
          <View style={styles.modalContent}>
            <View>
              <Text style={styles.titleText}>{this.props.title}</Text>
            </View>
            <View>
              <Text style={styles.messageText}>{this.props.message}</Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder={this.props.placeholder}
              onChangeText={this.handleChangeText}
            />
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={this._onPressCancel}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText} >Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this._onPressOK}
                style={[styles.okButton, {opacity: this._checkCount() ? 1.0 : 0.2}]}
                disabled={!this._checkCount()}
              >
                <Text style={styles.okButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
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
    marginTop: 5,
    marginBottom: 5,
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1
  },
  listItemText: {
    fontSize: 16
  },
  timestamp: {
    textAlign: 'right',
    fontSize: 14,
    color: 'gray'
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
  titleText: {
    textAlign: 'center',
    fontSize: 16
  },
  messageText: {
    textAlign: 'center',
    fontSize: 14
  },
  textInput: {
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
    padding: 4,
    borderColor: 'gray',
    borderWidth: 1
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  okButton: {
    width: 80,
    backgroundColor: 'blue',
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'blue',
    borderWidth: 1
  },
  okButtonText: {
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
});

export default HomeScreen;
