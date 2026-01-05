#!/bin/bash

# Service Management Script for BotSmith
# Usage: ./manage_services.sh [start|stop|restart|status]

CELERY_WORKERS=2
CELERY_LOG="/var/log/celery.log"

start_redis() {
    if pgrep -x "redis-server" > /dev/null; then
        echo "✅ Redis is already running"
    else
        echo "🚀 Starting Redis..."
        redis-server --daemonize yes --bind 127.0.0.1
        sleep 1
        if redis-cli ping > /dev/null 2>&1; then
            echo "✅ Redis started successfully"
        else
            echo "❌ Failed to start Redis"
            exit 1
        fi
    fi
}

stop_redis() {
    if pgrep -x "redis-server" > /dev/null; then
        echo "🛑 Stopping Redis..."
        redis-cli shutdown
        sleep 1
        echo "✅ Redis stopped"
    else
        echo "ℹ️  Redis is not running"
    fi
}

start_celery() {
    if pgrep -f "celery.*worker" > /dev/null; then
        echo "✅ Celery workers are already running"
        echo "   Active workers: $(pgrep -f "celery.*worker" | wc -l)"
    else
        echo "🚀 Starting Celery with $CELERY_WORKERS workers..."
        cd /app
        nohup /root/.venv/bin/celery -A backend.celery_app worker \
            --loglevel=info \
            --concurrency=$CELERY_WORKERS \
            --max-tasks-per-child=100 \
            > $CELERY_LOG 2>&1 &
        sleep 3
        if pgrep -f "celery.*worker" > /dev/null; then
            echo "✅ Celery started successfully"
            echo "   Active workers: $(pgrep -f "celery.*worker" | wc -l)"
        else
            echo "❌ Failed to start Celery"
            echo "   Check logs: tail -50 $CELERY_LOG"
            exit 1
        fi
    fi
}

stop_celery() {
    if pgrep -f "celery.*worker" > /dev/null; then
        echo "🛑 Stopping Celery workers..."
        pkill -9 -f "celery.*worker"
        sleep 2
        echo "✅ Celery workers stopped"
    else
        echo "ℹ️  Celery is not running"
    fi
}

status_all() {
    echo "=== SERVICE STATUS ==="
    echo ""
    
    # Supervisor services
    echo "📦 Supervisor Services:"
    sudo supervisorctl status
    echo ""
    
    # Redis
    echo "📦 Redis:"
    if pgrep -x "redis-server" > /dev/null; then
        if redis-cli ping > /dev/null 2>&1; then
            echo "   ✅ Running (PID: $(pgrep -x redis-server))"
        else
            echo "   ⚠️  Process exists but not responding"
        fi
    else
        echo "   ❌ Not running"
    fi
    echo ""
    
    # Celery
    echo "📦 Celery:"
    if pgrep -f "celery.*worker" > /dev/null; then
        worker_count=$(pgrep -f "celery.*worker" | wc -l)
        echo "   ✅ Running - $worker_count workers"
    else
        echo "   ❌ Not running"
    fi
    echo ""
    
    # Memory usage
    echo "💾 Memory Usage:"
    free -h | grep Mem | awk '{print "   Total: " $2 " | Used: " $3 " | Available: " $7}'
    echo ""
}

case "$1" in
    start)
        echo "🚀 Starting all services..."
        start_redis
        start_celery
        echo ""
        echo "✅ All services started!"
        ;;
    stop)
        echo "🛑 Stopping all services..."
        stop_celery
        stop_redis
        echo ""
        echo "✅ All services stopped!"
        ;;
    restart)
        echo "🔄 Restarting all services..."
        stop_celery
        stop_redis
        sleep 2
        start_redis
        start_celery
        echo ""
        echo "✅ All services restarted!"
        ;;
    status)
        status_all
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        echo ""
        echo "Commands:"
        echo "  start   - Start Redis and Celery services"
        echo "  stop    - Stop Redis and Celery services"
        echo "  restart - Restart Redis and Celery services"
        echo "  status  - Show status of all services"
        exit 1
        ;;
esac

exit 0
