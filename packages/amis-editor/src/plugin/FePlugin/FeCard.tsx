import {registerEditorPlugin} from 'amis-editor-core';
import {
  BaseEventContext,
  BasePlugin,
  BasicRendererInfo,
  PluginInterface,
  RendererInfoResolveEventContext,
  tipedLabel,
  RegionConfig
} from 'amis-editor-core';
import {defaultValue, getSchemaTpl} from 'amis-editor-core';
import {BUTTON_DEFAULT_ACTION} from '../../component/BaseControl';
import {getEventControlConfig} from '../../renderer/event-control/helper';
import {RendererPluginAction, RendererPluginEvent} from 'amis-editor-core';
import type {SchemaObject} from 'amis';
import {getOldActionSchema} from '../../renderer/event-control/helper';

export class FeCardPlugin extends BasePlugin {
  static id = 'FeCardPlugin';
  static scene = ['layout'];
  // 关联渲染器名字
  rendererName = 'fe-card';
  $schema = '/schemas/ActionSchema.json';

  order = -400;

  // 组件名称
  name = 'Fe卡片';
  isBaseComponent = true;
  description = '用来展示一个卡片';
  tags = ['功能'];
  icon = 'fa fa-square';
  scaffold: SchemaObject = {
    type: 'fe-card'
  };
  previewSchema: any = {
    type: 'fe-card',
    label: 'Fe按钮'
  };

  /**
   * 如果禁用了没办法编辑
   */
  filterProps(props: any) {
    props.disabled = false;
    return props;
  }

  regions: Array<RegionConfig> = [
    {
      key: 'body',
      label: '内容区'
    }
  ];
}

registerEditorPlugin(FeCardPlugin);
