import logging
import time


logger = logging.getLogger('rental_core.request')


class ApiRequestLoggingMiddleware:
    """Log API requests with status, timing, and user context."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.path.startswith('/api/'):
            return self.get_response(request)

        started = time.perf_counter()
        response = self.get_response(request)
        elapsed_ms = (time.perf_counter() - started) * 1000

        user_id = 'anonymous'
        if getattr(request, 'user', None) and request.user.is_authenticated:
            user_id = str(request.user.id)

        log_level = logging.INFO if response.status_code < 400 else logging.WARNING
        logger.log(
            log_level,
            'method=%s path=%s status=%s duration_ms=%.2f user_id=%s remote_addr=%s',
            request.method,
            request.get_full_path(),
            response.status_code,
            elapsed_ms,
            user_id,
            request.META.get('REMOTE_ADDR', '-'),
        )

        return response
