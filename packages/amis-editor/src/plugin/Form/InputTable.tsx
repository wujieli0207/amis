import React from 'react';
import {resolveVariable, Button} from 'amis';
import {
  registerEditorPlugin,
  BaseEventContext,
  BasePlugin,
  InsertEventContext,
  PluginEvent,
  ScaffoldForm,
  RegionConfig,
  RendererPluginEvent,
  defaultValue,
  getSchemaTpl,
  RendererPluginAction,
  tipedLabel,
  getI18nEnabled,
  repeatArray,
  mockValue
} from 'amis-editor-core';
import {setVariable} from 'amis-core';
import {getEnv} from 'mobx-state-tree';
import {ValidatorTag} from '../../validator';
import {getEventControlConfig} from '../../renderer/event-control/helper';
import { cloneDeep } from 'lodash';

export class TableControlPlugin extends BasePlugin {
  // 关联渲染器名字
  rendererName = 'input-table';
  $schema = '/schemas/TableControlSchema.json';

  // 组件名称
  name = '表格编辑框';
  isBaseComponent = true;
  icon = 'fa fa-table';
  pluginIcon = 'table-plugin';
  description =
    '可以用来展现数据的,可以用来展示数组类型的数据，比如 multiple  的子 form';
  docLink = '/amis/zh-CN/components/form/input-table';
  tags = ['表单项'];
  scaffold = {
    type: 'input-table',
    name: 'table',
    label: '表格表单',
    columns: [
      {
        label: 'color',
        name: 'color',
        quickEdit: {
          type: 'input-color'
        }
      },
      {
        label: '说明文字',
        name: 'name',
        quickEdit: {
          type: 'input-text',
          mode: 'inline'
        }
      }
    ],
    strictMode: true
  };

  regions: Array<RegionConfig> = [
    {
      key: 'columns',
      label: '列集合',
      renderMethod: 'renderTableContent',
      preferTag: '展示',
      dndMode: 'position-h'
    }
  ];

  previewSchema: any = {
    type: 'form',
    className: 'text-left',
    wrapWithPanel: false,
    mode: 'horizontal',
    body: {
      ...this.scaffold,
      value: [{color: 'green', name: '绿色'}]
    }
  };

  get scaffoldForm(): ScaffoldForm {
    const i18nEnabled = getI18nEnabled();
    return {
      title: '快速构建表格编辑框',
      body: [
        {
          name: 'columns',
          type: 'input-table',
          label: false,
          needConfirm: false,
          addable: true,
          removable: true,
          columns: [
            {
              type: 'text',
              name: 'label',
              label: '标题',
              quickEdit: {
                type: 'input-text',
                mode: 'inline'
              }
            },
            {
              type: 'text',
              name: 'name',
              label: '绑定字段名',
              quickEdit: {
                type: 'input-text',
                mode: 'inline'
              }
            },
            {
              type: 'text',
              name: 'type',
              label: '展示类型',
              quickEdit: {
                type: 'select',
                value: 'text',
                options: [
                  {
                    value: 'text',
                    label: '纯文本'
                  },
                  {
                    value: 'tpl',
                    label: '模板'
                  },
                  {
                    value: 'image',
                    label: '图片'
                  },
                  {
                    value: 'date',
                    label: '日期'
                  },
                  {
                      value: 'datetime',
                      label: '日期时间'
                  },
                  {
                      value: 'time',
                      label: '时间'
                  },
                  {
                    value: 'status',
                    label: '状态'
                  },
                  {
                    value: 'mapping',
                    label: '映射'
                  }
                ]
              }
            },
            {
              type: 'text',
              name: 'quickEdit.type',
              label: '编辑类型',
              quickEdit: {
                type: 'select',
                value: 'input-text',
                options: [
                  {
                    value: 'input-text',
                    label: '文本框'
                  },
                  {
                    value: 'input-number',
                    label: '数字框'
                  },
                  {
                    value: 'select',
                    label: '选择框'
                  },
                  {
                    value: 'input-color',
                    label: '颜色选择框'
                  },
                  {
                    value: 'checkboxes',
                    label: '多选框'
                  },
                  {
                    value: 'radios',
                    label: '单选框'
                  },
                  {
                    value: 'input-date',
                    label: '日期'
                  },
                  {
                    value: 'input-date-range',
                    label: '日期范围'
                  },
                  {
                    value: 'switch',
                    label: '开关'
                  },
                  {
                    value: 'nested-select',
                    label: '级联选择器'
                  },
                  {
                    value: 'city-select',
                    label: '城市选择器'
                  },
                  {
                    value: 'tree-select',
                    label: '树下拉框'
                  }
                ]
              }
            }
          ]
        }
      ],
      pipeOut: (schema: any) => {
        const columns = cloneDeep(schema.columns || []);
        const rawColumns: any = [];
        columns.forEach((column: any) => {
          const rawColumn = {
            ...column,
            type: column.type,
            quickEdit: {
              type: column.quickEdit.type,
              name: column.name
            }
          };
          rawColumns.push(rawColumn);
        });
        schema.columns = rawColumns;
        return {...schema};
      },
      canRebuild: true
    };
  }

  notRenderFormZone = true;

  panelJustify = true;
  panelTitle = '表格编辑';

  events: RendererPluginEvent[] = [
    // {
    //   eventName: 'add',
    //   eventLabel: '添加行',
    //   description: '点击左下角添加按钮 或 某一行右侧操作栏添加按钮时触发',
    //   dataSchema: [
    //     {
    //       type: 'object',
    //       properties: {
    //         'event.data.value': {
    //           type: 'array',
    //           title: '表格数据'
    //         }
    //       }
    //     }
    //   ]
    // },
    // {
    //   eventName: 'addConfirm',
    //   eventLabel: '确认添加',
    //   description: '开启needConfirm，点击添加按钮，填入数据后点击“保存”按钮后触发',
    //   dataSchema: [
    //     {
    //       type: 'object',
    //       properties: {
    //         'event.data.value': {
    //           type: 'array',
    //           title: '表格数据'
    //         },
    //         'event.data.item': {
    //           type: 'object',
    //           title: '添加项数据'
    //         },
    //         'event.data.index': {
    //           type: 'number',
    //           title: '添加项的行索引'
    //         }
    //       }
    //     }
    //   ]
    // },
    // {
    //   eventName: 'addSuccess',
    //   eventLabel: '添加成功',
    //   description: '开启needConfirm并且配置addApi，点击“保存”后调用接口成功时触发',
    //   dataSchema: [
    //     {
    //       type: 'object',
    //       properties: {
    //         'event.data.value': {
    //           type: 'array',
    //           title: '表格数据'
    //         },
    //         'event.data.item': {
    //           type: 'object',
    //           title: '添加项数据'
    //         },
    //         'event.data.index': {
    //           type: 'number',
    //           title: '添加项所在的行索引'
    //         }
    //       }
    //     }
    //   ]
    // },
    // {
    //   eventName: 'addFail',
    //   eventLabel: '添加失败',
    //   description: '开启needConfirm并且配置addApi，点击“保存”后调用接口失败时触发',
    //   dataSchema: [
    //     {
    //       type: 'object',
    //       properties: {
    //         'event.data.value': {
    //           type: 'array',
    //           title: '表格数据'
    //         },
    //         'event.data.item': {
    //           type: 'object',
    //           title: '添加项数据'
    //         },
    //         'event.data.index': {
    //           type: 'number',
    //           title: '添加项所在的行索引'
    //         },
    //         'event.data.error': {
    //           type: 'object',
    //           title: 'addApi请求失败后接口返回的错误信息'
    //         }
    //       }
    //     }
    //   ]
    // },
    // {
    //   eventName: 'edit',
    //   eventLabel: '编辑行',
    //   description: '点击某一行右侧操作栏“编辑”按钮时触发',
    //   dataSchema: [
    //     {
    //       type: 'object',
    //       properties: {
    //         'event.data.value': {
    //           type: 'array',
    //           title: '表格数据'
    //         },
    //         'event.data.item': {
    //           type: 'object',
    //           title: '编辑项数据'
    //         },
    //         'event.data.index': {
    //           type: 'number',
    //           title: '编辑项所在的行索引'
    //         }
    //       }
    //     }
    //   ]
    // },
    // {
    //   eventName: 'editConfirm',
    //   eventLabel: '编辑确认',
    //   description: '开启needConfirm，点击“编辑”按钮，填入数据后点击“保存”按钮后触发',
    //   dataSchema: [
    //     {
    //       type: 'object',
    //       properties: {
    //         'event.data.value': {
    //           type: 'array',
    //           title: '表格数据'
    //         },
    //         'event.data.item': {
    //           type: 'object',
    //           title: '编辑项数据'
    //         },
    //         'event.data.index': {
    //           type: 'number',
    //           title: '编辑项所在的行索引'
    //         }
    //       }
    //     }
    //   ]
    // },
    // {
    //   eventName: 'editSuccess',
    //   eventLabel: '编辑成功',
    //   description: '开启needConfirm并且配置updateApi，点击“保存”后调用接口成功时触发',
    //   dataSchema: [
    //     {
    //       type: 'object',
    //       properties: {
    //         'event.data.value': {
    //           type: 'array',
    //           title: '表格数据'
    //         },
    //         'event.data.item': {
    //           type: 'object',
    //           title: '编辑项数据'
    //         },
    //         'event.data.index': {
    //           type: 'number',
    //           title: '编辑项所在的行索引'
    //         }
    //       }
    //     }
    //   ]
    // },
    // {
    //   eventName: 'editFail',
    //   eventLabel: '编辑失败',
    //   description: '开启needConfirm并且配置updateApi，点击“保存”后调用接口失败时触发',
    //   dataSchema: [
    //     {
    //       type: 'object',
    //       properties: {
    //         'event.data.value': {
    //           type: 'array',
    //           title: '表格数据'
    //         },
    //         'event.data.item': {
    //           type: 'object',
    //           title: '编辑项数据'
    //         },
    //         'event.data.index': {
    //           type: 'number',
    //           title: '编辑项所在的行索引'
    //         },
    //         'event.data.error': {
    //           type: 'object',
    //           title: 'updateApi请求错误后返回的错误信息'
    //         }
    //       }
    //     }
    //   ]
    // },
    // {
    //   eventName: 'delete',
    //   eventLabel: '删除行',
    //   description: '点击某一行右侧操作栏“删除”按钮时触发',
    //   dataSchema: [
    //     {
    //       type: 'object',
    //       properties: {
    //         'event.data.value': {
    //           type: 'array',
    //           title: '表格数据'
    //         },
    //         'event.data.item': {
    //           type: 'object',
    //           title: '删除项数据'
    //         },
    //         'event.data.index': {
    //           type: 'object',
    //           title: '删除项所在的行索引'
    //         }
    //       }
    //     }
    //   ]
    // },
    // {
    //   eventName: 'deleteSuccess',
    //   eventLabel: '删除成功',
    //   description: '配置了deleteApi，调用接口成功时触发',
    //   dataSchema: [
    //     {
    //       type: 'object',
    //       properties: {
    //         'event.data.value': {
    //           type: 'array',
    //           title: '表格数据'
    //         },
    //         'event.data.item': {
    //           type: 'object',
    //           title: '删除项数据'
    //         },
    //         'event.data.index': {
    //           type: 'object',
    //           title: '删除项所在的行索引'
    //         }
    //       }
    //     }
    //   ]
    // },
    // {
    //   eventName: 'deleteFail',
    //   eventLabel: '删除失败',
    //   description: '配置了deleteApi，调用接口失败时触发',
    //   dataSchema: [
    //     {
    //       type: 'object',
    //       properties: {
    //         'event.data.value': {
    //           type: 'array',
    //           title: '表格数据'
    //         },
    //         'event.data.item': {
    //           type: 'object',
    //           title: '编辑项数据'
    //         },
    //         'event.data.index': {
    //           type: 'object',
    //           title: '编辑项所在的行索引'
    //         }
    //       }
    //     }
    //   ]
    // },
    // {
    //   eventName: 'change',
    //   eventLabel: '值变化',
    //   description: '组件数据发生改变时触发',
    //   dataSchema: [
    //     {
    //       type: 'object',
    //       properties: {
    //         'event.data.value': {
    //           type: 'array',
    //           title: '表格数据'
    //         }
    //       }
    //     }
    //   ]
    // }
  ];

  actions: RendererPluginAction[] = [
    {
      actionType: 'addItem',
      actionLabel: '新增',
      description: '新增单行数据'
    },
    {
      actionType: 'deleteItem',
      actionLabel: '删除',
      description: '删除单行数据'
    },
    {
      actionType: 'clear',
      actionLabel: '清空',
      description: '清除组件数据'
    },
    {
      actionType: 'reset',
      actionLabel: '重置',
      description: '将值重置为resetValue，若没有配置resetValue，则清空'
    },
    {
      actionType: 'setValue',
      actionLabel: '赋值',
      description: '触发表格数据更新'
    },
    {
      actionType: 'delete',
      actionLabel: '删除',
      description: '删除某行的数据'
    }
  ];

  panelBodyCreator = (context: BaseEventContext) => {
    const isCRUDBody = context.schema.type === 'crud';
    const i18nEnabled = getI18nEnabled();
    return getSchemaTpl('tabs', [
      {
        title: '属性',
        body: getSchemaTpl('collapseGroup', [
          {
            title: '基本',
            body: [
              getSchemaTpl('layout:originPosition', {value: 'left-top'}),
              getSchemaTpl('formItemName', {
                required: true
              }),
              getSchemaTpl('label'),
              {
                type: 'ae-Switch-More',
                name: 'needConfirm',
                label: tipedLabel(
                  '确认模式',
                  '开启时，新增、编辑需要点击表格右侧的“保存”按钮才能变更组件数据。未开启时，新增、编辑、删除操作直接改变组件数据。'
                ),
                mode: 'normal',
                formType: 'extend',
                hiddenOnDefault: true,
                form: {
                  body: [
                    {
                      type: i18nEnabled ? 'input-text-i18n' : 'input-text',
                      name: 'confirmBtnLabel',
                      label: '确认按钮名称',
                      placeholder: '确认按钮名称'
                    },
                    getSchemaTpl('icon', {
                      name: 'confirmBtnIcon',
                      label: '确认按钮图标'
                    }),
                    {
                      type: i18nEnabled ? 'input-text-i18n' : 'input-text',
                      name: 'cancelBtnLabel',
                      label: '取消按钮名称',
                      placeholder: '取消按钮名称',
                    },
                    getSchemaTpl('icon', {
                      name: 'cancelBtnIcon',
                      label: '取消按钮图标'
                    })
                  ]
                },
                pipeIn: (value: any, form: any) => {
                  if (!!value) {
                    const confirmBtnIcon = form.data.confirmBtnIcon !== undefined ? form.data.confirmBtnIcon : 'check';
                    const cancelBtnIcon = form.data.cancelBtnIcon !== undefined ? form.data.cancelBtnIcon : 'close';
                    form.setValueByName('confirmBtnIcon', confirmBtnIcon);
                    form.setValueByName('cancelBtnIcon', cancelBtnIcon);
                  }
                  return !!value;
                }
              },
              getSchemaTpl('creatable', {
                name: 'addable',
                formType: 'extend',
                hiddenOnDefault: true,
                form: {
                  body: [
                    {
                      label: tipedLabel('按钮名称', '此配置项只作用于表格操作栏的“新增”按钮'),
                      name: 'addBtnLabel',
                      type: i18nEnabled ? 'input-text-i18n' : 'input-text'
                    },
                    getSchemaTpl('icon', {
                      name: 'addBtnIcon',
                      label: tipedLabel('按钮图标', '此配置项只作用于表格操作栏的“新增”按钮')
                    }),
                    getSchemaTpl('apiControl', {
                      label: '新增接口',
                      name: 'addApi',
                      mode: 'row'
                    })
                  ]
                },
                pipeIn: (value: any, form: any) => {
                  if (!!value) {
                    const icon = form.data.addBtnIcon !== undefined ? form.data.addBtnIcon : 'plus';
                    form.setValueByName('addBtnIcon', icon);
                  }
                  return !!value;
                }
              }),
              {
                type: 'ae-switch-more',
                name: 'showFooterAddBtn',
                label: '表格下方新增按钮',
                mode: 'normal',
                formType: 'extend',
                hiddenOnDefault: true,
                value: true,
                visibleOn: 'this.addable',
                form: {
                  body: [
                    {
                      label: '按钮名称',
                      name: 'footerAddBtnLabel',
                      type: i18nEnabled ? 'input-text-i18n' : 'input-text',
                      pipeIn: defaultValue('新增')
                    },
                    getSchemaTpl('icon', {
                      name: 'footerAddBtnIcon',
                      label: '按钮图标'
                    }),
                  ]
                },
                pipeIn: (value: any, form: any, props: any) => {
                  if (!!value) {
                    const icon = form.data.footerAddBtnIcon !== undefined
                      ? form.data.footerAddBtnIcon
                      : 'plus';
                    form.setValueByName('footerAddBtnIcon', icon);
                  }
                  return !!value;
                }
              },
              {
                type: 'ae-switch-more',
                name: 'copyable',
                label: '可复制',
                mode: 'normal',
                formType: 'extend',
                hiddenOnDefault: true,
                form: {
                  body: [
                    {
                      label: '按钮名称',
                      name: 'copyBtnLabel',
                      type: i18nEnabled ? 'input-text-i18n' : 'input-text'
                    },
                    getSchemaTpl('icon', {
                      name: 'copyBtnLabel',
                      label: '按钮图标'
                    }),
                  ]
                },
                pipeIn: (value: any, form: any) => {
                  if (!!value) {
                    const icon = form.data.copyBtnIcon !== undefined ? form.data.copyBtnIcon : 'copy';
                    form.setValueByName('copyBtnIcon', icon);
                  }
                  return !!value;
                }
              },
              getSchemaTpl('editable', {
                type: 'ae-Switch-More',
                formType: 'extend',
                hiddenOnDefault: true,
                form: {
                  body: [
                    {
                      label: '按钮名称',
                      name: 'editBtnLabel',
                      type: i18nEnabled ? 'input-text-i18n' : 'input-text'
                    },
                    getSchemaTpl('icon', {
                      name: 'editBtnIcon',
                      label: '按钮图标'
                    }),
                    getSchemaTpl('apiControl', {
                      label: '编辑接口',
                      name: 'updateApi',
                      mode: 'row'
                    })
                  ]
                },
                pipeIn: (value: any, form: any) => {
                  if (!!value) {
                    const icon = form.data.editBtnIcon !== undefined ? form.data.editBtnIcon : 'pencil';
                    form.setValueByName('editBtnIcon', icon);
                  }
                  return !!value;
                }
              }),
              getSchemaTpl('removable', {
                type: 'ae-Switch-More',
                formType: 'extend',
                hiddenOnDefault: true,
                form: {
                  body: [
                    {
                      label: '按钮名称',
                      name: 'deleteBtnLabel',
                      type: i18nEnabled ? 'input-text-i18n' : 'input-text'
                    },
                    getSchemaTpl('icon', {
                      name: 'deleteBtnIcon',
                      label: '按钮图标'
                    }),
                    getSchemaTpl('deleteApi')
                  ]
                },
                pipeIn: (value: any, form: any) => {
                  if (!!value) {
                    const icon = form.data.deleteBtnIcon !== undefined ? form.data.deleteBtnIcon : 'minus';
                    form.setValueByName('deleteBtnIcon', icon);
                  }
                  return !!value;
                }
              }),
              getSchemaTpl('description'),
              getSchemaTpl('placeholder', {
                label: '空数据提示'
              }),
              getSchemaTpl('labelRemark'),
              getSchemaTpl('switch', {
                name: 'showIndex',
                label: '显示序号',
                pipeIn: defaultValue(false)
              }),
              {
                type: 'input-number',
                name: 'perPage',
                label: '每页展示条数',
                placeholder: '如果为空，则不进行分页'
              },
              {
                type: 'input-number',
                name: 'minLength',
                label: '最小行数',
                pipeIn: defaultValue(0)
              },
              {
                type: 'input-number',
                name: 'maxLength',
                label: '最大行数'
              }
            ]
          },
          {
            title: '高级',
            body: [
              getSchemaTpl('switch', {
                name: 'strictMode',
                label: tipedLabel(
                  '严格模式',
                  '为了性能，默认其他表单项项值变化不会让当前表格更新，有时候为了同步获取其他表单项字段，需要开启这个。'
                ),
                pipeIn: defaultValue(false)
              }),
              getSchemaTpl('switch', {
                name: 'canAccessSuperData',
                label: tipedLabel(
                  '获取父级数据',
                  '是否可以访问父级数据，也就是表单中的同级数据，通常需要跟 “严格模式”属性搭配使用。'
                ),
                pipeIn: defaultValue(false)
              })
            ]
          },
          getSchemaTpl('status', {isFormItem: true}),
          getSchemaTpl('validation', {
            tag: ValidatorTag.MultiSelect
          })
        ])
      },
      {
        title: '外观',
        body: getSchemaTpl('collapseGroup', [
          getSchemaTpl('style:formItem', {renderer: context.info.renderer}),
          getSchemaTpl('style:classNames', {
            schema: [
              getSchemaTpl('className', {
                name: 'rowClassName',
                label: '行样式',
              })
            ]
          })
        ])
      },
      // {
      //   title: '事件',
      //   className: 'p-none',
      //   body: [
      //     getSchemaTpl('eventControl', {
      //       name: 'onEvent',
      //       ...getEventControlConfig(this.manager, context)
      //     })
      //   ]
      // }
    ]);
  };

  filterProps(props: any) {
    const arr = Array.isArray(props.value)
      ? props.value
      : typeof props.source === 'string'
      ? resolveVariable(props.source, props.data)
      : resolveVariable('items', props.data);

    if (!Array.isArray(arr) || !arr.length) {
      const mockedData: any = {};

      if (Array.isArray(props.columns)) {
        props.columns.forEach((column: any) => {
          if (column.name) {
            setVariable(mockedData, column.name, mockValue(column));
          }
        });
      }

      props.value = repeatArray(mockedData, 1).map((item, index) => ({
        ...item,
        id: index + 1
      }));
    } else {
      // 只取10条预览，否则太多卡顿
      props.value = arr.slice(0, 10);
    }

    return props;
  }

  // 自动插入 label
  beforeInsert(event: PluginEvent<InsertEventContext>) {
    const context = event.context;
    if (
      (context.info.plugin === this ||
        context.node.sameIdChild?.info.plugin === this) &&
      context.region === 'columns'
    ) {
      context.data = {
        ...context.data,
        label: context.data.label ?? context.subRenderer?.name ?? '列名称'
      };
    }
  }
}

registerEditorPlugin(TableControlPlugin);
