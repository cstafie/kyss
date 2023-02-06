import axios from 'axios';
import { FormEvent, useCallback, useRef, useState } from 'react';
import Emoji from '../../components/emoji';

function Feedback() {
  const emailRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleFormSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    setSending(true);
    e.preventDefault();

    axios
      .post('/api/feedback', {
        email: emailRef?.current?.value || '',
        content: contentRef?.current?.value || '',
      })
      .then(() => {
        setSent(true);
        setSending(false);
      })
      .catch(() => {
        alert('There was an error sending your feedback');
        setSent(false);
        setSending(false);
      });
  }, []);

  return (
    <section className="w-full flex justify-center ">
      <div className="max-w-screen-xl px-6">
        <h2 className="py-4">FEEDBACK</h2>

        <p>
          You can use this form to leave feedback or contact me. Looking forward
          to hearing what you have to say!
        </p>

        {sending && 'Sending...'}
        {sent && 'Feedback sent!'}

        {!sending && !sent && (
          <form
            className="flex flex-col gap-4 pt-12"
            onSubmit={handleFormSubmit}
          >
            <label className="text-lg">Email (optional):</label>
            <input
              className="text-black rounded-md p-2"
              required={false}
              ref={emailRef}
              type="email"
              id="email"
            />
            <label className="text-lg">Feedback: </label>
            <textarea
              className="text-black rounded-md h-48 p-2"
              maxLength={10000}
              ref={contentRef}
              name="content"
            />

            <button type="submit" className="btn btn-blue">
              <Emoji description="Letter">✉️</Emoji> SEND
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default Feedback;
