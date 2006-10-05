<?php

class DojoFunctionBody
{
	private $dojo;
	private $package;
	private $start;
	private $end;
	
  public function __construct($dojo, $package)
  {
		$this->dojo = $dojo;
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
  }
}
  
?>