import * as Vue from 'vue/dist/vue'; // 注意这里要引同时包含编译器和运行时的完整版本
import {Renderer, RendererProps} from 'amis-core'; //  根据自定义组件的需求自行选择渲染器，Renderer、FormItem或者OptionsControl
import React from 'react';
import {autobind, normalizeApi, str2AsyncFunction} from 'amis-core';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import {BaseSchema} from '../../Schema';

import {Button as FeButton} from 'fehorizon-ui';
import 'fehorizon-ui/lib/button/style/index.css';
Vue.use(FeButton);

interface ActionState {
  inCountDown: boolean; // 是否在倒计时
  countDownEnd: number; // 倒计时结束的精确时间
  timeLeft: number; // 倒计时剩余时间
}

export interface FeButtonProps extends RendererProps {
  label: string;
  feButtonType: 'default' | 'primary' | 'dashed' | 'text' | 'link';
  feButtonTheme: 'default' | 'primary' | 'success' | 'error' | 'warning';
  feButtonSize?: 'large' | 'medium' | 'small' | 'mini';
  feButtonIcon?: string;
  feButtonRound?: boolean;
  disabled?: boolean;
}

export interface FeButtonSchema
  extends BaseSchema,
    Omit<FeButtonProps, 'type'> {
  type: 'fe-button';
}

export class FeButtonComponent extends React.Component<
  FeButtonProps,
  ActionState
> {
  vm: any;
  domRef: any;

  state: ActionState = {
    inCountDown: false,
    countDownEnd: 0,
    timeLeft: 0
  };

  localStorageKey: string;

  constructor(props: FeButtonProps) {
    super(props);

    this.domRef = React.createRef();
  }

  componentDidMount() {
    const amisData = {} as FeButtonProps;
    Object.keys(this.props).forEach(key => {
      const value = this.props[key];
      typeof value !== 'function' && (amisData[key] = value);
    });

    this.vm = new Vue({
      el: '#dom',
      template: `
        <fe-button 
          :type="feButtonType" 
          :theme="feButtonTheme" 
          :size="feButtonSize" 
          :icon="feButtonIcon"
          :round="feButtonRound"
          :disabled="disabled"
          @click="handleClick"
        >
          {{label}}
        </fe-button>
        `,
      data() {
        return Object.assign(amisData, {});
      },
      methods: {
        handleClick: this.handleAction
      }
    });
    // this.vm.$on('click', (value: any) => this.props.onEvent.click(value));

    this.domRef.current.appendChild(this.vm.$mount().$el);
  }

  componentDidUpdate(): void {
    Object.keys(this.props).forEach(key => {
      const value = this.props[key];
      typeof value !== 'function' && (this.vm[key] = value);
    });
  }

  componentWillUnmount() {
    this.vm.$destroy();
  }

  @autobind
  async handleAction(e: React.MouseEvent<any>) {
    console.log('e: ', e);
    const {onAction, onActionSensor, disabled, countDown, env} = this.props;
    // https://reactjs.org/docs/legacy-event-pooling.html
    // e.persist(); // 等 react 17之后去掉 event pooling 了，这个应该就没用了
    let onClick = this.props.onClick;
    console.log('onClick: ', onClick);

    if (typeof onClick === 'string') {
      onClick = str2AsyncFunction(onClick, 'event', 'props');
    }
    const result: any = onClick && (await onClick(e, this.props));

    if (
      disabled ||
      e.isDefaultPrevented() ||
      result === false ||
      !onAction ||
      this.state.inCountDown
    ) {
      return;
    }

    e.preventDefault();
    const action = pick(this.props) as FeButtonSchema;
    const actionType = action.actionType;

    // ajax 会在 wrapFetcher 里记录，这里再处理就重复了，因此去掉
    // add 一般是 input-table 之类的，会触发 formItemChange，为了避免重复也去掉
    if (
      actionType !== 'ajax' &&
      actionType !== 'download' &&
      actionType !== 'add'
    ) {
      env?.tracker(
        {
          eventType: actionType || this.props.type || 'click',
          eventData: omit(action, ['type', 'actionType', 'tooltipPlacement'])
        },
        this.props
      );
    }

    // // download 是一种 ajax 的简写
    // if (actionType === 'download') {
    //   action.actionType = 'ajax';
    //   const api = normalizeApi((action as AjaxActionSchema).api);
    //   api.responseType = 'blob';
    //   (action as AjaxActionSchema).api = api;
    // }

    const sensor: any = onAction(e, action);
    if (sensor?.then) {
      onActionSensor?.(sensor);
      await sensor;
    }

    if (countDown) {
      const countDownEnd = Date.now() + countDown * 1000;
      this.setState({
        countDownEnd: countDownEnd,
        inCountDown: true,
        timeLeft: countDown
      });
      localStorage.setItem(this.localStorageKey, String(countDownEnd));
      setTimeout(() => {
        this.handleCountDown();
      }, 1000);
    }
  }

  @autobind
  handleCountDown() {
    // setTimeout 一般会晚于 1s，经过几十次后就不准了，所以使用真实时间进行 diff
    const timeLeft = Math.floor((this.state.countDownEnd - Date.now()) / 1000);
    if (timeLeft <= 0) {
      this.setState({
        inCountDown: false,
        timeLeft: timeLeft
      });
    } else {
      this.setState({
        timeLeft: timeLeft
      });
      setTimeout(() => {
        this.handleCountDown();
      }, 1000);
    }
  }

  render() {
    return <div ref={this.domRef}></div>;
  }
}

@Renderer({
  type: 'fe-button'
})
export class FeButtonRenderer extends FeButtonComponent {}
