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
  AsyncStorage
} from 'react-native';
import prompt from 'react-native-prompt-android';
import SafeAreaView from 'react-native-safe-area-view';

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
      username: null
    };

    db.collection("topics")
      .onSnapshot(snapshot => {
        this.setState({
          topics: snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }))
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

    if (Platform.OS == 'ios') {
      AlertIOS.prompt(
        'Username',
        message,
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: name => this._saveUsername(name) },
        ],
      );
    } else if (Platform.OS == 'android') {
      prompt(
        'Username',
        message,
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: name => this._saveUsername(name) },
        ],
        {
          type: 'default',
          cancelable: true,
          defaultValue: '',
          placeholder: 'Username'
        }
      )
    }
  };

  _onPressNew = () => {
    if (Platform.OS == 'ios') {
      AlertIOS.prompt(
        'New topic',
        'Input new topic name.',
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: name => this._newTopic(name) },
        ],
      );
    } else if (Platform.OS == 'android') {
      prompt(
        'New topic',
        'Input new topic name.',
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: name => this._newTopic(name) },
        ],
        {
          type: 'default',
          cancelable: true,
          defaultValue: '',
          placeholder: 'New topic'
        }
      )
    }
  };

  _newTopic = (name) => {
    db.collection("topics").add({
      name: name,
      created_at: new Date()
    });
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <MyList
          navigation={this.props.navigation}
          data={this.state.topics}
          username={this.state.username}
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
    marginTop: 5,
    marginBottom: 5,
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1
  },
  listItemText: {
    fontSize: 16
  }
});

export default HomeScreen;
