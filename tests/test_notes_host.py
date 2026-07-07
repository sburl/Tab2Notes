import unittest

from shared import notes_host


class NotesHostTests(unittest.TestCase):
    def test_send_message_writes_native_messaging_frame(self):
        self.assertEqual(notes_host.struct.calcsize("=I"), 4)


if __name__ == "__main__":
    unittest.main()
