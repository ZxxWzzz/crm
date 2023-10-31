// ==UserScript==
// @name         crm系统自动回访脚本
// @namespace    https://crm-vip.xiaomawang.com
// @version      1.0
// @description  调整代码结构
// @author       旺旺老师-to free
// @match        https://crm-vip.xiaomawang.com/student/list-cc-mine/not-enrolled*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 默认时间，你可以在这里设置初始时间
    var savedYear = localStorage.getItem('customYear') || '';
    var savedMonth = localStorage.getItem('customMonth') || '';
    var savedDay = localStorage.getItem('customDay') || '';

    // 创建浮动窗口
    var floatingWindow = document.createElement('div');
    floatingWindow.id = 'myFloatingWindow'; // 为浮动窗口添加一个唯一的 ID
    floatingWindow.style.position = 'fixed';
    floatingWindow.style.bottom = '20px';
    floatingWindow.style.right = '20px';
    floatingWindow.style.width = '200px';
    floatingWindow.style.height = '180px'; // 更改窗口高度为180px
    floatingWindow.style.backgroundColor = 'white';
    floatingWindow.style.border = '1px solid #ccc';
    floatingWindow.style.zIndex = '9999';
    floatingWindow.style.textAlign = 'center';
    floatingWindow.style.padding = '10px';

    // 创建输入框
    function createInput(placeholder, value) {
        var input = document.createElement('input');
        input.type = 'text';
        input.placeholder = placeholder;
        input.style.marginRight = '5px';
        input.value = value || '';
        return input;
    }

    // 创建按钮
    function createButton(text) {
        var button = document.createElement('button');
        button.textContent = text;
        return button;
    }

    // 添加年、月、日输入框
    var yearInput = createInput('年', savedYear);
    var monthInput = createInput('月', savedMonth);
    var dayInput = createInput('日', savedDay);

    // 添加按钮
    var showDateButton = createButton('Start');

    // 添加显示错误消息的元素
    var errorDiv = document.createElement('div');
    errorDiv.id = 'errorDiv'; // 为错误消息添加一个唯一的 ID
    errorDiv.style.color = 'red'; // 设置颜色为红色，以表示错误消息
    floatingWindow.appendChild(errorDiv);

    // 添加显示日期的结果区域
    var resultDiv = document.createElement('div');

    // 将输入框、按钮和结果区域添加到浮动窗口
    floatingWindow.appendChild(yearInput);
    floatingWindow.appendChild(monthInput);
    floatingWindow.appendChild(dayInput);
    floatingWindow.appendChild(showDateButton);

    // 添加拖动功能
    var isDragging = false;
    var initialX, initialY;

    // 鼠标按下事件
    floatingWindow.addEventListener('mousedown', function(e) {
        isDragging = true;
        initialX = e.clientX - floatingWindow.getBoundingClientRect().left;
        initialY = e.clientY - floatingWindow.getBoundingClientRect().top;
    });

    // 鼠标移动事件
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            floatingWindow.style.left = (e.clientX - initialX) + 'px';
            floatingWindow.style.top = (e.clientY - initialY) + 'px';
        }
    });

    // 鼠标释放事件
    document.addEventListener('mouseup', function() {
        isDragging = false;
    });

    // 将浮动窗口添加到页面
    document.body.appendChild(floatingWindow);

    //按钮被点击
    showDateButton.addEventListener('click', function() {
        savedYear = yearInput.value;
        savedMonth = monthInput.value;
        savedDay = dayInput.value;

        // 保存用户输入的时间
        localStorage.setItem('customYear', savedYear);
        localStorage.setItem('customMonth', savedMonth);
        localStorage.setItem('customDay', savedDay);

        //验证时间
        resultDiv.textContent = ''; // 清空之前的结果消息
        if (!isValidDate(savedYear, savedMonth, savedDay)) {
            errorDiv.textContent = '时间格式无效'; // 显示错误消息
        } else {
            errorDiv.textContent = ''; // 清空之前的结果消息
            // 直接查找第一个报名超链接
            var signUpLink = document.querySelector('tbody.ant-table-tbody .ant-table-row.ant-table-row-level-0 a[href*="/student/list-cc-mine/not-enrolled/add-tracking-record/"]');
            if (signUpLink) {
                // 点击报名超链接
                signUpLink.click();
                // 等待回访备注文本框出现
                waitForElement('#revisit_info_remark', function() {
                    // 获取回访备注文本框
                    var remarkTextarea = document.getElementById('revisit_info_remark');
                    //输入文本
                    if (remarkTextarea) {
                        // 设置要输入的文本
                        var textToInput = '未接通';

                        // 将文本设置为文本框的值
                        remarkTextarea.value = textToInput;

                        // 查找日期时间输入框
                        var dateTimeInput = document.getElementById('revisit_info_next_time');

                        if (dateTimeInput) {
                            // 设置要输入的时间
                            var inputTime = savedYear + '-' + savedMonth + '-' + savedDay;

                            // 创建 MutationObserver 实例，监视日期时间输入框的变化
                            var observer = new MutationObserver(function(mutationsList) {
                                // 循环检查每个变化
                                for (var mutation of mutationsList) {
                                    // 检查是否是子节点的值发生了变化
                                    if (mutation.type === 'childList' && mutation.target === dateTimeInput) {
                                        // 重新设置日期
                                        dateTimeInput.value = inputTime;
                                        // 停止监视，以免触发多次
                                        observer.disconnect();
                                        break;

                                    }
                                }
                            });

                            // 配置 MutationObserver，监视子节点的变化
                            var config = { childList: true, subtree: true };

                            // 启动 MutationObserver
                            observer.observe(dateTimeInput, config);

                            // 设置日期时间输入框的值
                            dateTimeInput.value = inputTime;

                            //
                        }
                    }
                });
            }
        }
    });

    // 验证日期格式
    function isValidDate(year, month, day) {
        var date = new Date(year, month - 1, day);
        return date.getFullYear() == year && date.getMonth() == month - 1 && date.getDate() == day;
    }

    // 等回访框元素出现
    function waitForElement(selector, callback) {
        var interval = setInterval(function() {
            var element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                callback();
            }
        }, 500);
    }
})();
