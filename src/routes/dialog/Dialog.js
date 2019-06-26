/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Dialog.css';

class Dialog extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      dialogFull: '',
      dialogPartial: '',
      speechRecognizing: false,
    };
  }

  componentDidMount() {
    const speechRecognition = new webkitSpeechRecognition(); // eslint-disable-line new-cap, no-undef

    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.lang = 'cmn-Hant-TW';

    speechRecognition.onresult = this.onSpeechRecognitionResult;

    this.speechRecognition = speechRecognition;
  }

  changeSpeechRecognition = () => {
    if (this.state.speechRecognizing) {
      this.speechRecognition.stop();

      this.setState({
        speechRecognizing: false,
      });
    } else {
      this.speechRecognition.start();

      this.setState({
        speechRecognizing: true,
      });
    }
  };

  onSpeechRecognitionResult = event => {
    let { dialogFull } = this.state;
    let dialogPartial = '';

    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      if (event.results[i].isFinal) {
        dialogFull = `${dialogFull}${event.results[i][0].transcript}`;
        dialogPartial = '';
      } else {
        dialogPartial = `${dialogPartial}${event.results[i][0].transcript}`;
      }
    }

    this.setState({
      dialogFull,
      dialogPartial,
    });
  };

  render() {
    const dialog = `${this.state.dialogFull}${this.state.dialogPartial}`;

    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>{this.props.title}</h1>
          <p className={s.lead}>開啟麥克風以錄製使用者對話</p>
          <form method="post">
            <div className={s.formGroup}>
              <label // eslint-disable-line
                className={s.label}
                style={{ position: 'relative' }}
                htmlFor="callerDialog"
              >
                <textarea
                  className={s.input}
                  id="callerDialog"
                  name="callerDialog"
                  rows="15"
                  cols="50"
                  value={dialog}
                  readOnly
                />
                <img // eslint-disable-line
                  className={s.micBtn}
                  src={
                    this.state.speechRecognizing ? 'mic-animate.gif' : 'mic.gif'
                  }
                  alt="Microphone Button"
                  onClick={this.changeSpeechRecognition}
                />
              </label>
            </div>
            <div className={s.formGroup}>
              <button className={s.button} type="button">
                下一步
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Dialog);
