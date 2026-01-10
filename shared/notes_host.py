#!/usr/bin/env python3
"""
Shared native messaging host for Chrome extensions.
Creates Apple Notes from Chrome extension messages.
"""

import json
import struct
import subprocess
import sys


def read_message():
    """Read a message from Chrome extension via stdin."""
    raw_length = sys.stdin.buffer.read(4)
    if not raw_length:
        return None
    message_length = struct.unpack('=I', raw_length)[0]
    message = sys.stdin.buffer.read(message_length).decode('utf-8')
    return json.loads(message)


def send_message(message):
    """Send a message back to Chrome extension via stdout."""
    encoded = json.dumps(message).encode('utf-8')
    sys.stdout.buffer.write(struct.pack('=I', len(encoded)))
    sys.stdout.buffer.write(encoded)
    sys.stdout.buffer.flush()


def create_apple_note(title, content):
    """Create a new Apple Note using AppleScript."""
    # Escape special characters for AppleScript
    escaped_content = content.replace('\\', '\\\\').replace('"', '\\"')
    escaped_title = title.replace('\\', '\\\\').replace('"', '\\"')
    
    applescript = f'''
    tell application "Notes"
        tell account "iCloud"
            make new note with properties {{name:"{escaped_title}", body:"{escaped_content}"}}
        end tell
        activate
    end tell
    '''
    
    try:
        subprocess.run(
            ['osascript', '-e', applescript],
            check=True,
            capture_output=True,
            text=True
        )
        return True, None
    except subprocess.CalledProcessError as e:
        # Try with default account if iCloud fails
        applescript_fallback = f'''
        tell application "Notes"
            make new note with properties {{name:"{escaped_title}", body:"{escaped_content}"}}
            activate
        end tell
        '''
        try:
            subprocess.run(
                ['osascript', '-e', applescript_fallback],
                check=True,
                capture_output=True,
                text=True
            )
            return True, None
        except subprocess.CalledProcessError as e2:
            return False, str(e2.stderr)


def main():
    """Main loop to process messages from Chrome extension."""
    message = read_message()
    
    if message is None:
        send_message({'success': False, 'error': 'No message received'})
        return
    
    action = message.get('action')
    
    if action == 'createNote':
        title = message.get('title', 'Chrome Extension Note')
        content = message.get('content', '')
        success, error = create_apple_note(title, content)
        
        if success:
            send_message({'success': True})
        else:
            send_message({'success': False, 'error': error})
    else:
        send_message({'success': False, 'error': f'Unknown action: {action}'})


if __name__ == '__main__':
    main()



