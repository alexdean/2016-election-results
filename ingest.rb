require 'logger'
require 'csv'
require 'json'
require 'pathname'

log = Logger.new($stderr).tap{|l| l.level = Logger::INFO }

this_dir = Pathname.new(File.dirname(File.realpath(__FILE__)))
source_dir = this_dir.join('source')
tmp_dir = this_dir.join('tmp')

locations_file = source_dir.join('county_locations.csv')
elections_file = source_dir.join('US_County_Level_Presidential_Results_08-16.csv')

locations_data = {}
CSV.foreach(locations_file, headers: true) do |row|
  locations_data[row['fips']] = row
end


out = []

CSV.foreach(elections_file, headers: true) do |election|
  location = locations_data[election['fips_code']]

  if location.nil?
    # new FIPS code issued for Oglala Lakota County, SD
    # https://pairlist7.pair.net/pipermail/sbe-eas/Week-of-Mon-20150504/002722.html
    if election['fips_code'] == '46113'
      location = locations_data['46102']
    else
      log.error "election fips_code: #{election['fips_code']} has no location data."
      next
    end
  end
  out << {
    fips: election['fips_code'],
    name: election['county'],
    x: location['centroid_x'].to_f,
    y: location['centroid_y'].to_f,
    dem: election['dem_2016'].to_i,
    gop: election['gop_2016'].to_i,
    other: election['oth_2016'].to_i
  }
end

File.open(tmp_dir.join('data.json'), 'w') { |f| f.write(out.to_json) }
