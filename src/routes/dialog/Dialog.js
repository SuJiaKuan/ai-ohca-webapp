/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import axios from 'axios';
import includes from 'lodash/includes';
import s from './Dialog.css';

const STEP = {
  INPUT: 'INPUT',
  ANALYSIS: 'ANALYSIS',
};
const KEY_WORDS = ['沒氣', '梗塞', '呼吸', '微弱', '胸口'];

class Dialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      step: STEP.INPUT,
      dialogFull: '',
      dialogPartial: '',
      dialogWords: [],
      speechRecognizing: false,
      needOHCA: false,
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

  analyzeDialog = async () => {
    const dialog = `${this.state.dialogFull}${this.state.dialogPartial}`;

    try {
      let res = await axios.post('http://localhost:3009/cut', {
        data: dialog,
      });
      const dialogWords = res.data;

      res = await axios.post('http://localhost:3009/ohca', {
        data: dialog,
      });
      const needOHCA = res.data.ohca;

      this.setState({
        step: STEP.ANALYSIS,
        dialogWords,
        needOHCA,
      });
    } catch (err) {
      // TODO(feabries su): Error handling.
      console.error(err);
    }
  };

  renderWordSegments = (words, keyWords) => (
    <div className={s.formGroup}>
      {words.map(word => {
        const style = {};

        if (includes(keyWords, word)) {
          style.color = 'red';
        }

        return <span style={style}>{word}</span>;
      })}
    </div>
  );

  renderOHCA = isNeeded => {
    const text = isNeeded ? 'OHCA' : 'SAFE';
    const className = cx({
      [s.ohca]: true,
      [s.ohcaDanger]: isNeeded,
      [s.ohcaSafe]: !isNeeded,
    });

    return <p className={className}>{text}</p>;
  };

  render() {
    const dialog = `${this.state.dialogFull}${this.state.dialogPartial}`;
    const wordSegments = this.renderWordSegments(
      this.state.dialogWords,
      KEY_WORDS,
    );
    const ohca = this.renderOHCA(this.state.needOHCA);

    return (
      <div className={s.root}>
        {this.state.step === STEP.INPUT && (
          <div className={s.container}>
            <h1>使用者對話</h1>
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
                      this.state.speechRecognizing
                        ? 'mic-animate.gif'
                        : 'mic.gif'
                    }
                    alt="Microphone Button"
                    onClick={this.changeSpeechRecognition}
                  />
                </label>
              </div>
              <div className={s.formGroup}>
                <button
                  className={s.button}
                  type="button"
                  disabled={this.state.speechRecognizing}
                  onClick={this.analyzeDialog}
                >
                  分析
                </button>
              </div>
            </form>
          </div>
        )}
        {this.state.step === STEP.ANALYSIS && (
          <div className={s.container}>
            <h1>分析結果</h1>
            <strong className={s.lineThrough}>關鍵字</strong>
            <form method="post">{wordSegments}</form>
            <strong className={s.lineThrough}>OHCA</strong>
            {ohca}
          </div>
        )}
      </div>
    );
  }
}

export default withStyles(s)(Dialog);
