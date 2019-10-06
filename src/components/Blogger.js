import _ from 'lodash';
import cookie from 'react-cookies'
import React, { Component } from 'react';
import { Layout, Button, Modal, Form, Input, Upload, Icon, Alert, message, Card } from 'antd';
import Axios from 'axios';

const { Header, Footer, Sider, Content } = Layout;
const { Meta } = Card;

const { TextArea } = Input;

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}


class Blogger extends Component {
    constructor() {
        super();

        this.state = {
            items: [],
            visible: false,
            text: null,
            title: null,
            file: null,
            filelist: null,
            loading: false,
            url: 'https://blob-test-server.herokuapp.com'
        };
    }

    componentDidMount() {
        this.setAuthCookie();
        this.getList();
    }

    setAuthCookie() {
        cookie.save('auth', 'itsmeipromise', { path: '/' });
    };

    async getList() {
        const { url } = this.state;

        Axios.get(`${url}/list`)
            .then(({ data }) => {
                if (data && data.length > 0) {
                    this.setState({
                        items: data
                    });
                }
            }).catch((e) => {
                message.error(`Error occurred while fetching list: ${e}`);
            });
    }

    showModal() {
        this.setState({
            visible: true
        });
    }

    handleOk() {
        let err = false;
        const { title, text, file } = this.state;

        if (!title || title === '') {
            message.error('Please enter posts title');
            err = true;
        }

        if (!text || text === '') {
            message.error('Please enter posts anons');
            err = true;
        }

        if (!file) {
            message.error('Please select posts preview image');
            err = true;
        }

        if (!err) {
            this.sendData();
        }
    }

    handleCancel() {
        this.setState({
            visible: false,
            filelist: null,
            file: null,
            text: null,
            loading: false,
            title: null
        });
    }

    handleInputChange(event) {
        this.setState({ title: event.target.value });
    }

    handleTextareaChange(event) {
        this.setState({ text: event.target.value });
    }

    handleUploadChange(event) {
        let file = event.file;

        console.log(event);

        this.setState({ filelist: [file], file });
    }

    renderPosts() {
        const { items } = this.state;

        if (items == null || items.length <= 0) {
            return (
                <Alert
                    message="Warning"
                    description="No blog posts found. Try add some."
                    type="warning"
                    showIcon
                />
            );
        }

        return (
            <div className="grid-container">
                {
                    _.map(items, (item) => {
                        return this.renderBlogCard(item);
                    })
                }
            </div>
        );
    }

    renderBlogCard(item) {
        if (!item) return null;
        const { url } = this.state;
        const { title, text, image } = item;

        return (
            <div className="grid-cell">
                <Card
                    //style={{ width: 300 }}
                    cover={
                        <img
                            alt="example"
                            src={`${url}/img?id=${image}`}
                        />
                    }
                    actions={[
                        <Icon type="setting" key="setting" />,
                        <Icon type="edit" key="edit" />,
                        <Icon type="ellipsis" key="ellipsis" />,
                    ]}
                >
                    <Meta
                        //avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                        title={title}
                        description={text}
                    />
                </Card>
            </div>
        );
    }

    async sendData() {
        const { title, text, file, url, items } = this.state;

        const img = await getBase64(file.originFileObj)

        this.setState({
            loading: true
        });

        const data = {
            auth: 'itsmeipromise',
            title,
            text,
            image: img
        }

        const stringData = JSON.stringify(data);

        const config = {
            timeout: 10000,
            headers: {
                'Content-Type': 'text/plain'
                //'Content-Type': 'application/json'
            },

        };

        Axios.post(`${url}/post`, data, config).then(({ data }) => {
            console.log('Result: ', data);

            if (data && data.result === 'success') {
                message.success('Your post successfully added');

                items.push(data.item);
            } else {
                message.error(data.error.join('<br>'));
            }

            this.setState({
                loading: false,
                items
            });
        }).catch((e) => {
            this.setState({
                loading: false
            });
            message.error(`Error occurred while fetchong: ${e}`);
        });
    }

    render() {
        const { visible, title, text, filelist, loading } = this.state;

        console.log('Process:', process);

        return (
            <Layout>
                <Content>
                    {this.renderPosts()}
                </Content>

                <Modal
                    title="Add post"
                    visible={visible}
                    okButtonProps={{
                        loading: loading
                    }}
                    onOk={this.handleOk.bind(this)}
                    onCancel={this.handleCancel.bind(this)}
                >
                    <Form onSubmit={this.handleSubmit} ref={ref => this.form = ref}>
                        <Form.Item label="Title">
                            <Input
                                value={title}
                                onChange={this.handleInputChange.bind(this)}
                            />
                        </Form.Item>

                        <Form.Item label="Anons">
                            <TextArea
                                value={text}
                                rows={4}
                                onChange={this.handleTextareaChange.bind(this)}
                            />
                        </Form.Item>

                        <Form.Item label="Preview">
                            <Upload onChange={this.handleUploadChange.bind(this)} multiple={false} fileList={filelist}>
                                <Button>
                                    <Icon type="upload" /> Upload
                                </Button>
                            </Upload>
                        </Form.Item>
                    </Form>
                </Modal>

                <div className="float-bottom-button right">
                    <Button
                        type="primary"
                        shape="circle"
                        icon="plus"
                        onClick={this.showModal.bind(this)}
                        size="large"

                    />
                </div>
            </Layout >
        );
    }
}

export default Blogger;