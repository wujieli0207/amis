import {registerEditorPlugin} from 'amis-editor-core';
import {
  BaseEventContext,
  BasePlugin,
  BasicRendererInfo,
  PluginInterface,
  RendererInfoResolveEventContext,
  tipedLabel
} from 'amis-editor-core';
import {defaultValue, getSchemaTpl} from 'amis-editor-core';
import {BUTTON_DEFAULT_ACTION} from '../../component/BaseControl';
import {getEventControlConfig} from '../../renderer/event-control/helper';
import {RendererPluginAction, RendererPluginEvent} from 'amis-editor-core';
import type {SchemaObject} from 'amis';
import {getOldActionSchema} from '../../renderer/event-control/helper';

export class FeButtonPlugin extends BasePlugin {
  static id = 'FeButtonPlugin';
  static scene = ['layout'];
  // 关联渲染器名字
  rendererName = 'fe-button';
  $schema = '/schemas/ActionSchema.json';

  order = -400;

  // 组件名称
  name = 'Fe按钮';
  isBaseComponent = true;
  description =
    '用来展示一个Fe按钮，你可以配置不同的展示样式，配置不同的点击行为。';
  docLink = '/amis/zh-CN/components/button';
  tags = ['功能'];
  icon = 'fa fa-square';
  pluginIcon = 'button-plugin';
  scaffold: SchemaObject = {
    type: 'fe-button',
    label: 'Fe按钮',
    feButtonTheme: 'primary',
    feButtonType: 'primary',
    feButtonSize: 'medium',
    feButtonRound: false,
    disabled: false,
    ...BUTTON_DEFAULT_ACTION
  };
  previewSchema: any = {
    type: 'fe-button',
    label: 'Fe按钮'
  };

  panelTitle = 'Fe按钮';

  // 事件定义
  events: RendererPluginEvent[] = [
    {
      eventName: 'click',
      eventLabel: '点击',
      description: '点击时触发',
      defaultShow: true,
      dataSchema: [
        {
          type: 'object',
          properties: {
            context: {
              type: 'object',
              title: '上下文',
              properties: {
                nativeEvent: {
                  type: 'object',
                  title: '鼠标事件对象'
                }
              }
            }
          }
        }
      ]
    },
    {
      eventName: 'mouseenter',
      eventLabel: '鼠标移入',
      description: '鼠标移入时触发',
      dataSchema: [
        {
          type: 'object',
          properties: {
            context: {
              type: 'object',
              title: '上下文',
              properties: {
                nativeEvent: {
                  type: 'object',
                  title: '鼠标事件对象'
                }
              }
            }
          }
        }
      ]
    },
    {
      eventName: 'mouseleave',
      eventLabel: '鼠标移出',
      description: '鼠标移出时触发',
      dataSchema: [
        {
          type: 'object',
          properties: {
            context: {
              type: 'object',
              title: '上下文',
              properties: {
                nativeEvent: {
                  type: 'object',
                  title: '鼠标事件对象'
                }
              }
            }
          }
        }
      ]
    }
    // {
    //   eventName: 'doubleClick',
    //   eventLabel: '双击',
    //   description: '鼠标双击事件'
    // }
  ];

  // 动作定义
  actions: RendererPluginAction[] = [];

  panelJustify = true;

  panelBodyCreator = (context: BaseEventContext) => {
    const isInDialog = /(?:\/|^)dialog\/.+$/.test(context.path);
    const isInDrawer = /(?:\/|^)drawer\/.+$/.test(context.path);

    // TODO: 旧方法无法判断，context 中没有 dropdown-button 的信息，临时实现
    // const isInDropdown = /(?:\/|^)dropdown-button\/.+$/.test(context.path);
    const isInDropdown = /^button-group\/.+$/.test(context.path);

    const buttonStateFunc = (visibleOn: string, state: string) => {
      return [
        getSchemaTpl('theme:font', {
          label: '文字',
          name: `themeCss.className.font:${state}`,
          visibleOn: visibleOn,
          editorThemePath: [
            `button1.type.\${level}.${state}.body.font-color`,
            `button1.size.\${size}.body.font`
          ]
        }),
        getSchemaTpl('theme:colorPicker', {
          label: '背景',
          name: `themeCss.className.background:${state}`,
          labelMode: 'input',
          needGradient: true,
          needImage: true,
          visibleOn: visibleOn,
          editorThemePath: `button1.type.\${level}.${state}.body.bg-color`
        }),
        getSchemaTpl('theme:border', {
          name: `themeCss.className.border:${state}`,
          visibleOn: visibleOn,
          editorThemePath: `button1.type.\${level}.${state}.body.border`
        }),
        getSchemaTpl('theme:paddingAndMargin', {
          name: `themeCss.className.padding-and-margin:${state}`,
          visibleOn: visibleOn,
          editorThemePath: `button1.size.\${size}.body.padding-and-margin`
        }),
        getSchemaTpl('theme:radius', {
          name: `themeCss.className.radius:${state}`,
          visibleOn: visibleOn,
          editorThemePath: `button1.size.\${size}.body.border`
        }),
        getSchemaTpl('theme:size', {
          label: '图标尺寸',
          name: `themeCss.iconClassName.iconSize:${state}`,
          visibleOn: visibleOn,
          editorThemePath: `button1.size.\${size}.body.icon-size`
        })
      ];
    };

    return getSchemaTpl('tabs', [
      {
        title: '属性',
        body: getSchemaTpl('collapseGroup', [
          {
            title: '基本',
            body: [
              getSchemaTpl('layout:originPosition', {value: 'left-top'}),
              getSchemaTpl('label', {
                label: '名称'
              }),
              {
                label: '主题色',
                name: 'feButtonTheme',
                type: 'select',
                pipeIn: defaultValue('primary'),
                options: [
                  {
                    label: 'default',
                    value: 'default'
                  },
                  {
                    label: 'primary',
                    value: 'primary'
                  },
                  {
                    label: 'success',
                    value: 'success'
                  },
                  {
                    label: 'error',
                    value: 'error'
                  },
                  {
                    label: 'warning',
                    value: 'warning'
                  }
                ]
              },
              {
                label: '按钮类型',
                name: 'feButtonType',
                type: 'select',
                pipeIn: defaultValue('primary'),
                options: [
                  {
                    label: 'default',
                    value: 'default'
                  },
                  {
                    label: 'primary',
                    value: 'primary'
                  },
                  {
                    label: 'dashed',
                    value: 'dashed'
                  },
                  {
                    label: 'text',
                    value: 'text'
                  },
                  {
                    label: 'link',
                    value: 'link'
                  }
                ]
              },
              {
                label: '尺寸',
                name: 'feButtonSize',
                type: 'select',
                pipeIn: defaultValue('medium'),
                options: [
                  {
                    label: 'large',
                    value: 'large'
                  },
                  {
                    label: 'medium',
                    value: 'medium'
                  },
                  {
                    label: 'small',
                    value: 'small'
                  },
                  {
                    label: 'mini',
                    value: 'mini'
                  }
                ]
              },
              {
                label: '前缀图标',
                name: 'feButtonIcon',
                type: 'input-text'
              },
              {
                label: '是否带有圆角',
                name: 'feButtonRound',
                type: 'switch'
              }
            ]
          },
          getSchemaTpl('status', {
            disabled: true
          })
        ])
      },
      {
        title: '外观',
        body: getSchemaTpl('collapseGroup', [
          {
            title: '基本',
            body: [
              getSchemaTpl('buttonLevel', {
                label: '样式',
                name: 'level',
                hidden: isInDropdown
              }),

              getSchemaTpl('buttonLevel', {
                label: '高亮样式',
                name: 'activeLevel',
                hidden: isInDropdown,
                visibleOn: 'data.active'
              }),

              getSchemaTpl('switch', {
                name: 'block',
                label: '块状显示',
                hidden: isInDropdown
              }),

              getSchemaTpl('size', {
                label: '尺寸',
                hidden: isInDropdown
              })
            ]
          },
          {
            title: '自定义样式',
            body: [
              {
                type: 'select',
                name: 'editorState',
                label: '状态',
                selectFirst: true,
                options: [
                  {
                    label: '常规',
                    value: 'default'
                  },
                  {
                    label: '悬浮',
                    value: 'hover'
                  },
                  {
                    label: '点击',
                    value: 'active'
                  }
                ]
              },
              ...buttonStateFunc(
                "${editorState == 'default' || !editorState}",
                'default'
              ),
              ...buttonStateFunc("${editorState == 'hover'}", 'hover'),
              ...buttonStateFunc("${editorState == 'active'}", 'active')
            ]
          },
          getSchemaTpl('theme:cssCode', {
            themeClass: [
              {
                value: '',
                state: ['default', 'hover', 'active']
              }
            ]
          })
        ])
      },
      {
        title: '事件',
        className: 'p-none',
        body:
          !!context.schema.actionType ||
          ['submit', 'reset'].includes(context.schema.type)
            ? [
                getSchemaTpl('eventControl', {
                  name: 'onEvent',
                  ...getEventControlConfig(this.manager, context)
                }),
                getOldActionSchema(this.manager, context)
              ]
            : [
                getSchemaTpl('eventControl', {
                  name: 'onEvent',
                  ...getEventControlConfig(this.manager, context)
                })
              ]
      }
    ]);
  };

  /**
   * 如果禁用了没办法编辑
   */
  filterProps(props: any) {
    props.disabled = false;
    return props;
  }

  /**
   * 如果配置里面有 rendererName 自动返回渲染器信息。
   * @param renderer
   */
  getRendererInfo({
    renderer,
    schema
  }: RendererInfoResolveEventContext): BasicRendererInfo | void {
    const plugin: PluginInterface = this;

    if (
      schema.$$id &&
      plugin.name &&
      plugin.rendererName &&
      plugin.rendererName === renderer.name
    ) {
      // 复制部分信息出去
      return {
        name: schema.label ? schema.label : plugin.name,
        regions: plugin.regions,
        patchContainers: plugin.patchContainers,
        // wrapper: plugin.wrapper,
        vRendererConfig: plugin.vRendererConfig,
        wrapperProps: plugin.wrapperProps,
        wrapperResolve: plugin.wrapperResolve,
        filterProps: plugin.filterProps,
        $schema: plugin.$schema,
        renderRenderer: plugin.renderRenderer
      };
    }
  }
}

registerEditorPlugin(FeButtonPlugin);
