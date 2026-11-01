[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -ReferencedAssemblies 'System.Speech' -TypeDefinition @'
using System;
using System.Speech.Recognition;

public class VoiceDictator
{
    private static SpeechRecognitionEngine engine;

    public static void Start()
    {
        try
        {
            engine = new SpeechRecognitionEngine();
            engine.LoadGrammar(new DictationGrammar());
            engine.SetInputToDefaultAudioDevice();

            engine.SpeechRecognized += (s, e) =>
            {
                if (e.Result != null && !string.IsNullOrWhiteSpace(e.Result.Text))
                {
                    Console.WriteLine("FINAL:" + e.Result.Text);
                    Console.Out.Flush();
                }
            };

            engine.SpeechHypothesized += (s, e) =>
            {
                if (e.Result != null && !string.IsNullOrWhiteSpace(e.Result.Text))
                {
                    Console.WriteLine("INTERIM:" + e.Result.Text);
                    Console.Out.Flush();
                }
            };

            engine.RecognizeAsync(RecognizeMode.Multiple);
            Console.WriteLine("READY");
            Console.Out.Flush();

            while (true)
            {
                string line = Console.ReadLine();
                if (line == null || line.Trim() == "STOP")
                {
                    break;
                }
            }

            if (engine != null)
            {
                engine.RecognizeAsyncStop();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("ERROR:" + ex.Message);
            Console.Out.Flush();
        }
    }
}
'@

[VoiceDictator]::Start()
