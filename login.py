from flask import Flask, request, jsonify
import datetime
import json
import os
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# 确保存储目录存在
LOG_DIR = "../logs"
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)


# 解决跨域问题
@app.after_request
def cors(environ):
    environ.headers['Access-Control-Allow-Origin'] = '*'
    environ.headers['Access-Control-Allow-Method'] = '*'
    environ.headers['Access-Control-Allow-Headers'] = 'x-requested-with,content-type'
    return environ


# 检查用户名是否存在
@app.route('/check_username', methods=['POST'])
def check_username():
    try:
        data = request.get_json(force=True)
        username = data.get('username')

        if not username:
            return jsonify({"available": False, "message": "用户名不能为空"}), 400

        # 读取所有日志文件查找用户名
        username_exists = False
        for filename in os.listdir(LOG_DIR):
            if filename.startswith('login_') and filename.endswith('.json'):
                file_path = os.path.join(LOG_DIR, filename)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        logs = json.load(f)
                        for log in logs:
                            stored_username = log["user_info"]["userId"]
                            if stored_username == username:
                                username_exists = True
                                break
                except json.JSONDecodeError:
                    continue  # 跳过损坏的文件
                if username_exists:
                    break

        return jsonify({"available": not username_exists})

    except Exception as e:
        return jsonify({"available": False, "message": str(e)}), 500


# 登录接口
@app.route('/login', methods=['POST'])
def login():
    try:
        # 获取并验证JSON数据
        json_data = request.get_json(force=True)
        username = json_data.get("userId")
        password = json_data.get("password")

        if not username or not password:
            return jsonify({
                "status": "error",
                "message": "缺少必要的用户信息"
            }), 400

        # 查找用户记录
        user_found = False
        for filename in os.listdir(LOG_DIR):
            if filename.startswith('login_') and filename.endswith('.json'):
                file_path = os.path.join(LOG_DIR, filename)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        logs = json.load(f)
                        for log in logs:
                            stored_username = log["user_info"]["userId"]
                            stored_hash = log["user_info"]["password_hash"]
                            if stored_username == username:
                                user_found = True
                                # 验证密码
                                if check_password_hash(stored_hash, password):
                                    return jsonify({
                                        "status": "success",
                                        "message": "登录成功"
                                    })
                                else:
                                    return jsonify({
                                        "status": "error",
                                        "message": "密码错误"
                                    }), 401
                except json.JSONDecodeError:
                    continue  # 跳过损坏的文件

        # 如果未找到用户
        if not user_found:
            return jsonify({
                "status": "error",
                "message": "用户不存在"
            }), 404

    except Exception as e:
        # 记录错误日志
        error_log = {
            "timestamp": datetime.datetime.now().isoformat(),
            "action": "login_error",
            "error_message": str(e),
            "request_data": request.get_json(silent=True)
        }
        error_file = os.path.join(LOG_DIR, f"error_{datetime.date.today()}.json")

        with open(error_file, 'a', encoding='utf-8') as f:
            json.dump(error_log, f, ensure_ascii=False)
            f.write('\n')

        return jsonify({
            "status": "error",
            "message": "登录过程中发生错误"
        }), 500


# 注册接口 - 优化：同时存储明文密码和加密密码
@app.route('/register', methods=['POST'])
def register():
    try:
        # 获取并验证JSON数据
        json_data = request.get_json(force=True)
        username = json_data.get("userId")
        password = json_data.get("password")

        if not username or not password:
            raise ValueError("缺少必要的用户信息")

        # 构建结构化日志对象 - 同时包含明文密码和加密密码
        log_entry = {
            "timestamp": datetime.datetime.now().isoformat(),
            "user_info": {
                "userId": username,
                "password_hash": generate_password_hash(password),
                "raw_password": password  # 新增：存储明文密码
            },
            "status": "success",
            "message": "注册成功"
        }

        # 保存日志到JSON文件
        log_file = os.path.join(LOG_DIR, f"login_{datetime.date.today()}.json")

        # 检查重复项
        existing_logs = []
        if os.path.exists(log_file):
            with open(log_file, 'r', encoding='utf-8') as f:
                try:
                    existing_logs = json.load(f)
                except json.JSONDecodeError:
                    existing_logs = []  # 重置损坏的日志

            # 检查用户名是否重复
            for log in existing_logs:
                stored_user = log["user_info"]["userId"]
                if stored_user == username:
                    raise ValueError("用户名已存在")

        # 写入新记录
        with open(log_file, 'w', encoding='utf-8') as f:
            updated_logs = existing_logs + [log_entry]
            json.dump(updated_logs, f, ensure_ascii=False, indent=2)

        # 返回成功响应
        return jsonify({
            "status": "success",
            "message": "注册成功"
        })

    except Exception as e:
        # 记录错误日志
        error_log = {
            "timestamp": datetime.datetime.now().isoformat(),
            "action": "register_error",
            "error_message": str(e),
            "request_data": request.get_json(silent=True)
        }
        error_file = os.path.join(LOG_DIR, f"error_{datetime.date.today()}.json")

        with open(error_file, 'a', encoding='utf-8') as f:
            json.dump(error_log, f, ensure_ascii=False)
            f.write('\n')

        # 返回错误响应
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 400


if __name__ == '__main__':
    app.run(port=8899, debug=True)