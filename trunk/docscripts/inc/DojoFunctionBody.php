<?php

class DojoFunctionBody
{
	private $package;
	private $start;
	private $end;
	
  public function __construct($package)
  {
		$this->package = $package;
  }
	
	public function setStart($line, $position)
	{
		$this->start = array($line, $position);
	}
	
	public function setEnd($line, $position)
	{
		$this->end = array($line, $position);
	}
  
  public function build()
  {
		if (!$this->start) {
      die("DojoFunctionBody->build() used before setting a start position");
    }
		
		$balance = 0;
		$start_position = $this->start[1];
		$lines = Text::chop($this->package->getCode(), $this->start[0], $this->start[1]);
		foreach ($lines as $line_number => $line) {
      $chars = array_slice(Text::toArray($line), $start_position, strlen($line), true);
      $start_position = 0;
      foreach ($chars as $char_position => $char) {
        if ($char == '{') {
          ++$balance;
        }
        elseif ($char == '}') {
          --$balance;
					if (!$balance) {
						$end = array($line_number, $char_position);
						$this->setEnd($end[0], $end[1]);
						return $end;
					}
        }
      }
		}
  }
}
  
?>