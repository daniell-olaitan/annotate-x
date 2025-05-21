from flask import jsonify
from flask.typing import ResponseReturnValue


def handle_bad_request(e: Exception) -> ResponseReturnValue:
    return jsonify({
        'status': 'Failed',
        'error': 'Bad Request',
        'message': str(e).split(':', 1)[1].strip()
    }), 400


def handle_not_found(e: Exception) -> ResponseReturnValue:
    return jsonify({
        'status': 'Failed',
        'error': 'Not Found',
        'message': str(e).split(':', 1)[1].strip()
    }), 404


def handle_unauthorized(e: Exception) -> ResponseReturnValue:
    return jsonify({
        'status': 'Failed',
        'error': 'Unauthorized',
        'message': str(e).split(':', 1)[1].strip()
    }), 401


def handle_internal_server_error(e: Exception) -> ResponseReturnValue:
    return jsonify({
        'status': 'Failed',
        'error': 'Internal Server Error',
        'message': 'Internal Server Error'
    }), 500
